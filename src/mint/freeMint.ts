import { Dexy } from "./dexy";
import { Box, ensureUTxOBigInt, BoxCandidate, Amount } from "@fleet-sdk/common";
import {
  ErgoAddress,
  ErgoUnsignedInput,
  ErgoUnsignedTransaction,
  InputsCollection,
  OutputBuilder,
  OutputsCollection,
  TransactionBuilder,
} from "@fleet-sdk/core";
import { SConstant, SInt, SLong } from "@fleet-sdk/serializer";

class FreeMint extends Dexy {
  private readonly T_free = 360n;
  private readonly T_buffer = 5n;

  constructor(oracleBox: Box<Amount>, lpBox: Box<Amount>) {
    super(ensureUTxOBigInt(oracleBox), ensureUTxOBigInt(lpBox));
  }

  createFreeMintTransaction(
    tx_fee: number,
    mintValue: number,
    freeMintInBox: Box<Amount>,
    buybackInBox: Box<Amount>,
    bankInBox: Box<Amount>,
    userInBoxes: Box<Amount>[],
    user_address: ErgoAddress,
    HEIGHT: number,
  ): ErgoUnsignedTransaction {
    const freeMintIn = ensureUTxOBigInt(freeMintInBox);
    const availableToMint = this.availableToMint(freeMintIn, HEIGHT);
    if (mintValue > availableToMint)
      throw new Error("Mint Value is more than available to mint");
    else {
      const bankIn = ensureUTxOBigInt(bankInBox);
      const buybackIn = ensureUTxOBigInt(buybackInBox);
      const userBoxes = userInBoxes.map((userBox) => ensureUTxOBigInt(userBox));

      const buybackInWithContext = new ErgoUnsignedInput(
        buybackIn,
      ).setContextExtension({ 0: SInt(1) });
      const inputs = new InputsCollection([
        freeMintIn,
        bankIn,
        buybackInWithContext,
        ...userBoxes,
      ]);
      const outputs = new OutputsCollection();

      const userFund = userBoxes.reduce((a, b) => {
        return a + b.value;
      }, 0n);
      if (userFund < this.ergNeeded(mintValue))
        new Error("Not enough ERG in user boxes");

      const freeMintOut = new OutputBuilder(
        freeMintIn.value,
        freeMintIn.ergoTree,
        HEIGHT,
      );
      freeMintOut.setAdditionalRegisters({
        R4: !this.isCounterReset(freeMintIn, HEIGHT)
          ? SConstant.from<number>(freeMintIn.additionalRegisters.R4)
          : SInt(Number(BigInt(HEIGHT) + this.T_free + this.T_buffer)),
        R5: SLong(availableToMint - BigInt(mintValue)),
      });
      freeMintOut.addTokens(freeMintIn.assets);
      const freeMintOutBuild = freeMintOut.build();
      outputs.add(freeMintOut);

      const bankBoxOut = new OutputBuilder(
        bankIn.value + this.ergNeededBankBox(mintValue),
        bankIn.ergoTree,
        HEIGHT,
      );
      bankBoxOut.addTokens(bankIn.assets.at(0));
      bankBoxOut.addTokens({
        tokenId: bankIn.assets.at(1).tokenId,
        amount: bankIn.assets.at(1).amount - BigInt(mintValue),
      });
      const bankBoxOutBuild = bankBoxOut.build();
      outputs.add(bankBoxOut);

      const buybackBoxOut = new OutputBuilder(
        buybackIn.value + this.ergNeededBuyBackBox(mintValue),
        buybackIn.ergoTree,
        HEIGHT,
      );
      buybackBoxOut.addTokens(buybackIn.assets);
      const buybackBoxOutBuild = buybackBoxOut.build();
      outputs.add(buybackBoxOut);

      if (
        !this.validSuccessor(
          freeMintIn,
          freeMintOutBuild,
          bankIn,
          bankBoxOutBuild,
          HEIGHT,
        )
      )
        throw new Error("Invalid successor");
      else if (
        !this.validDelta(bankIn, bankBoxOutBuild, buybackIn, buybackBoxOutBuild)
      )
        throw new Error("Invalid delta");
      else if (!this.validRateFreeMint())
        throw new Error("Invalid free mint rate");
      else if (!this.validAmount(bankIn, bankBoxOutBuild, freeMintIn, HEIGHT))
        throw new Error("Invalid amount");

      return new TransactionBuilder(HEIGHT)
        .from(inputs)
        .to(outputs.toArray())
        .sendChangeTo(user_address)
        .withDataFrom([this.oracleBox, this.lpBox])
        .payFee(tx_fee.toString())
        .build();
    }
  }

  // TODO: transaction as input
  transactionValidator(
    freeMintIn: Box<bigint>,
    freeMintOut: Box<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: Box<bigint>,
    buybackBoxIn: Box<bigint>,
    buybackBoxOut: Box<bigint>,
    HEIGHT: number,
  ) {
    return (
      this.validSuccessor(
        freeMintIn,
        freeMintOut,
        bankBoxIn,
        bankBoxOut,
        HEIGHT,
      ) &&
      this.validDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut) &&
      this.validRateFreeMint() &&
      this.validAmount(bankBoxIn, bankBoxOut, freeMintIn, HEIGHT)
    );
  }

  validBuybackDelta(
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    buybackBoxIn: Box<bigint>,
    buybackBoxOut: BoxCandidate<bigint>,
  ) {
    return (
      this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) >=
        this.dexyMinted(bankBoxIn, bankBoxOut) * this.buybackRate() &&
      this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) > 0
    );
  }

  validDelta(
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    buybackBoxIn: Box<bigint>,
    buybackBoxOut: BoxCandidate<bigint>,
  ) {
    return (
      this.validBankDelta(bankBoxIn, bankBoxOut) &&
      this.validBuybackDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut)
    );
  }

  validAmount(
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    freeMintIn: Box<bigint>,
    HEIGHT: number,
  ) {
    const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut);
    const availableToMint = this.availableToMint(freeMintIn, HEIGHT);
    return dexyMinted <= availableToMint;
  }

  isCounterReset(freeMintIn: Box<bigint>, HEIGHT: number) {
    return (
      BigInt(HEIGHT) >
      SConstant.from<bigint>(freeMintIn.additionalRegisters.R4).data
    );
  }

  maxAllowedIfReset() {
    return this.lpReservesY() / 100n;
  }

  availableToMint(freeMintIn: Box<bigint>, HEIGHT: number) {
    const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT);
    return isCounterReset
      ? this.maxAllowedIfReset()
      : SConstant.from<bigint>(freeMintIn.additionalRegisters.R5).data;
  }

  validSuccessorR4(
    freeMintIn: Box<bigint>,
    freeMintOut: BoxCandidate<bigint>,
    HEIGHT: number,
  ) {
    const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT);
    if (!isCounterReset) {
      return (
        SConstant.from<bigint>(freeMintOut.additionalRegisters.R4).data ===
        SConstant.from<bigint>(freeMintIn.additionalRegisters.R4).data
      );
    } else {
      return (
        SConstant.from<bigint>(freeMintOut.additionalRegisters.R4).data >=
          BigInt(HEIGHT) + this.T_free &&
        SConstant.from<bigint>(freeMintOut.additionalRegisters.R4).data <=
          BigInt(HEIGHT) + this.T_free + this.T_buffer
      );
    }
  }

  validSuccessorR5(
    freeMintIn: Box<bigint>,
    freeMintOut: BoxCandidate<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    HEIGHT: number,
  ) {
    return (
      SConstant.from<bigint>(freeMintOut.additionalRegisters.R5).data ===
      this.availableToMint(freeMintIn, HEIGHT) -
        this.dexyMinted(bankBoxIn, bankBoxOut)
    );
  }

  validSuccessor(
    freeMintIn: Box<bigint>,
    freeMintOut: BoxCandidate<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    HEIGHT: number,
  ) {
    return (
      freeMintOut.ergoTree === freeMintIn.ergoTree &&
      freeMintOut.value >= freeMintIn.value &&
      this.validSuccessorR4(freeMintIn, freeMintOut, HEIGHT) &&
      this.validSuccessorR5(
        freeMintIn,
        freeMintOut,
        bankBoxIn,
        bankBoxOut,
        HEIGHT,
      )
    );
  }
}

export { FreeMint };
