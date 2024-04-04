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

class ArbitrageMint extends Dexy {
  private readonly T_arb = 30n;
  private readonly T_buffer = 5n;

  constructor(oracleBox: Box<Amount>, lpBox: Box<Amount>) {
    super(ensureUTxOBigInt(oracleBox), ensureUTxOBigInt(lpBox));
  }

  createArbitrageMintTransaction(
    tx_fee: number,
    mintValue: number,
    arbitrageMintInBox: Box<Amount>,
    buybackInBox: Box<Amount>,
    bankInBox: Box<Amount>,
    userInBoxes: Box<Amount>[],
    user_address: ErgoAddress,
    tracking101InBox: Box<Amount>,
    HEIGHT: number,
  ): ErgoUnsignedTransaction {
    const arbitrageMintIn = ensureUTxOBigInt(arbitrageMintInBox);
    const buybackIn = ensureUTxOBigInt(buybackInBox);
    const bankIn = ensureUTxOBigInt(bankInBox);
    const userBoxes = userInBoxes.map((userBox) => ensureUTxOBigInt(userBox));
    const tracking101In = ensureUTxOBigInt(tracking101InBox);

    const availableToMint = this.availableToMint(arbitrageMintIn, HEIGHT);
    if (mintValue > availableToMint)
      throw new Error("Mint Value is more than available to mint");
    else {
      const buybackInWithContext = new ErgoUnsignedInput(
        buybackIn,
      ).setContextExtension({ 0: SInt(1) });
      const inputs = new InputsCollection([
        arbitrageMintIn,
        bankIn,
        buybackInWithContext,
        ...userBoxes,
      ]);
      const outputs = new OutputsCollection();

      const userFund = userBoxes.reduce((a, b) => {
        return a + b.value;
      }, 0n);
      if (userFund < this.ergNeeded(mintValue))
        throw new Error("Not enough ERG in user boxes");
      const arbitrageMintOut = new OutputBuilder(
        arbitrageMintIn.value,
        arbitrageMintIn.ergoTree,
        HEIGHT,
      );
      arbitrageMintOut.setAdditionalRegisters({
        R4: !this.isCounterReset(arbitrageMintIn, HEIGHT)
          ? SConstant.from<number>(arbitrageMintIn.additionalRegisters.R4)
          : SInt(Number(BigInt(HEIGHT) + this.T_arb + this.T_buffer)),
        R5: SLong(availableToMint - BigInt(mintValue)),
      });
      arbitrageMintOut.addTokens(arbitrageMintIn.assets);
      const arbitrageMintOutBuild = arbitrageMintOut.build();
      outputs.add(arbitrageMintOut);

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
          arbitrageMintIn,
          arbitrageMintOutBuild,
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
      else if (
        !this.validAmount(bankIn, bankBoxOutBuild, arbitrageMintIn, HEIGHT)
      )
        throw new Error("Invalid amount");
      else if (!this.validDelay(tracking101In, HEIGHT))
        throw new Error("Invalid delay");
      else if (!this.validThreshold()) throw new Error("Invalid threshold");

      return new TransactionBuilder(HEIGHT)
        .from(inputs)
        .to(outputs.toArray())
        .sendChangeTo(user_address)
        .withDataFrom([this.oracleBox, this.lpBox, tracking101In])
        .payFee(tx_fee.toString())
        .build();
    }
  }

  // // TODO: transaction as input
  transactionValidator(
    arbitrageMintIn: Box<bigint>,
    arbitrageMintOut: BoxCandidate<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    buybackBoxIn: Box<bigint>,
    buybackBoxOut: BoxCandidate<bigint>,
    tracking101Box: Box<bigint>,
    HEIGHT: number,
  ) {
    return (
      this.validSuccessor(
        arbitrageMintIn,
        arbitrageMintOut,
        bankBoxIn,
        bankBoxOut,
        HEIGHT,
      ) &&
      this.validDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut) &&
      this.validAmount(bankBoxIn, bankBoxOut, arbitrageMintIn, HEIGHT) &&
      this.validDelay(tracking101Box, HEIGHT) &&
      this.validThreshold()
    );
  }

  validDelay(tracking101Box: Box<bigint>, HEIGHT: number) {
    return (
      SConstant.from<bigint>(tracking101Box.additionalRegisters.R7).data <
      BigInt(HEIGHT) - this.T_arb
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
    arbitrageMintIn: Box<bigint>,
    HEIGHT: number,
  ) {
    const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut);
    const availableToMint = this.availableToMint(arbitrageMintIn, HEIGHT);
    return dexyMinted <= availableToMint;
  }

  isCounterReset(arbitrageMintIn: Box<bigint>, HEIGHT: number) {
    return (
      BigInt(HEIGHT) >
      SConstant.from<bigint>(arbitrageMintIn.additionalRegisters.R4).data
    );
  }

  maxAllowedIfReset() {
    return (
      (this.lpReservesX() - this.oracleRateWithFee() * this.lpReservesY()) /
      this.oracleRateWithFee()
    );
  }

  availableToMint(arbitrageMintIn: Box<bigint>, HEIGHT: number) {
    const isCounterReset = this.isCounterReset(arbitrageMintIn, HEIGHT);
    return isCounterReset
      ? this.maxAllowedIfReset()
      : SConstant.from<bigint>(arbitrageMintIn.additionalRegisters.R5).data;
  }

  validSuccessorR4(
    arbitrageMintIn: Box<bigint>,
    arbitrageMintOut: BoxCandidate<bigint>,
    HEIGHT: number,
  ) {
    const isCounterReset = this.isCounterReset(arbitrageMintIn, HEIGHT);
    if (!isCounterReset) {
      return (
        SConstant.from<bigint>(arbitrageMintOut.additionalRegisters.R4).data ===
        SConstant.from<bigint>(arbitrageMintIn.additionalRegisters.R4).data
      );
    } else {
      return (
        SConstant.from<bigint>(arbitrageMintOut.additionalRegisters.R4).data >=
          BigInt(HEIGHT) + this.T_arb &&
        SConstant.from<bigint>(arbitrageMintOut.additionalRegisters.R4).data <=
          BigInt(HEIGHT) + this.T_arb + this.T_buffer
      );
    }
  }

  validSuccessorR5(
    arbitrageMintIn: Box<bigint>,
    arbitrageMintOut: BoxCandidate<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    HEIGHT: number,
  ) {
    return (
      SConstant.from<bigint>(arbitrageMintOut.additionalRegisters.R5).data ===
      this.availableToMint(arbitrageMintIn, HEIGHT) -
        this.dexyMinted(bankBoxIn, bankBoxOut)
    );
  }

  validSuccessor(
    arbitrageMintIn: Box<bigint>,
    arbitrageMintOut: BoxCandidate<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
    HEIGHT: number,
  ) {
    return (
      arbitrageMintOut.ergoTree === arbitrageMintIn.ergoTree &&
      arbitrageMintOut.value >= arbitrageMintIn.value &&
      this.validSuccessorR4(arbitrageMintIn, arbitrageMintOut, HEIGHT) &&
      this.validSuccessorR5(
        arbitrageMintIn,
        arbitrageMintOut,
        bankBoxIn,
        bankBoxOut,
        HEIGHT,
      )
    );
  }
}

export { ArbitrageMint };
