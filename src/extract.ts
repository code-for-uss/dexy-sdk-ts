import { Amount, Box, BoxCandidate, ensureUTxOBigInt } from "@fleet-sdk/common";
import {
  ErgoAddress,
  ErgoUnsignedTransaction,
  InputsCollection,
  OutputBuilder,
  OutputsCollection,
  TransactionBuilder,
} from "@fleet-sdk/core";
import { Dexy } from "./mint/dexy";

// TODO: Tested on chain but need to add unit test for this scenario
class Extract extends Dexy {
  private readonly minBankNanoErgs = 1000000000000n;
  protected tracking95In: Box<bigint>;
  protected tracking101In: Box<bigint>;
  protected extractIn: Box<bigint>;
  protected bankIn: Box<bigint>;
  protected userBoxes: Box<bigint>[];
  protected user_address: ErgoAddress;
  protected HEIGHT: number;

  constructor(
    oracleBox: Box<Amount>,
    lpBox: Box<Amount>,
    extractInBox: Box<Amount>,
    tracking95InBox: Box<Amount>,
    tracking101InBox: Box<Amount>,
    bankBox: Box<Amount>,
    userInBoxes: Box<Amount>[],
    user_address: ErgoAddress,
    HEIGHT: number,
  ) {
    super(ensureUTxOBigInt(oracleBox), ensureUTxOBigInt(lpBox));
    this.extractIn = ensureUTxOBigInt(extractInBox);
    this.tracking95In = ensureUTxOBigInt(tracking95InBox);
    this.tracking101In = ensureUTxOBigInt(tracking101InBox);
    this.bankIn = ensureUTxOBigInt(bankBox);
    this.tracking95In = ensureUTxOBigInt(tracking95InBox);
    this.userBoxes = userInBoxes.map((userBox) => ensureUTxOBigInt(userBox));
    this.user_address = user_address;
    this.HEIGHT = HEIGHT;
  }

  createExtractTransaction(tx_fee: number): ErgoUnsignedTransaction {
    let RELEASE = false;
    if (!this.validBankBox(this.bankIn)) {
      RELEASE = true;
    }
    const inputs = new InputsCollection([
      this.lpBox,
      this.extractIn,
      ...this.userBoxes,
    ]);
    const outputs = new OutputsCollection();
    const userFund = this.userBoxes.reduce((a, b) => {
      return a + b.value;
    }, 0n);
    if (userFund < tx_fee) throw new Error("user fund is not enough");

    const lpOut = new OutputBuilder(
      this.lpReservesX(),
      this.lpBox.ergoTree,
      this.HEIGHT,
    );
    lpOut.addTokens(this.lpBox.assets.slice(0, 2));
    const oracleRateXY = this.oracleRate();
    const lpReservesXOut = this.lpReservesX();
    let deltaDexy = this.lpReservesY();
    if (RELEASE) {
      deltaDexy -= (lpReservesXOut * 100n) / (oracleRateXY * 101n);
      lpOut.addTokens({
        tokenId: this.lpBox.assets.at(2).tokenId,
        amount: (lpReservesXOut * 100n) / (oracleRateXY * 101n),
      });
    } else {
      deltaDexy -= (lpReservesXOut * 100n) / (oracleRateXY * 97n);
      lpOut.addTokens({
        tokenId: this.lpBox.assets.at(2).tokenId,
        amount: (lpReservesXOut * 100n) / (oracleRateXY * 97n),
      });
    }
    const lpOutBuild = lpOut.build();
    outputs.add(lpOut);

    const extractOut = new OutputBuilder(
      this.extractIn.value,
      this.extractIn.ergoTree,
      this.HEIGHT,
    );
    extractOut.addTokens(this.extractIn.assets.at(0));
    extractOut.addTokens({
      tokenId: this.extractIn.assets.at(1).tokenId,
      amount: this.extractIn.assets.at(1).amount + deltaDexy,
    });
    const extractOutBuild = extractOut.build();
    outputs.add(extractOut);

    if (
      !this.validExtract(lpOutBuild, this.bankIn, extractOutBuild) &&
      !this.validRelease(extractOutBuild, lpOutBuild)
    )
      throw new Error("Extract and Release is not valid");
    else if (!this.validLpBox(lpOutBuild, extractOutBuild))
      throw new Error("Lp box is not valid");

    const tx_builder = new TransactionBuilder(this.HEIGHT)
      .from(inputs)
      .to(outputs.toArray())
      .sendChangeTo(this.user_address)
      .payFee(tx_fee.toString());

    if (RELEASE) {
      tx_builder.withDataFrom([this.oracleBox, this.tracking101In]);
    } else {
      tx_builder.withDataFrom([this.oracleBox, this.tracking95In, this.bankIn]);
    }
    return tx_builder.build();
  }

  deltaDexy(extractOut: BoxCandidate<bigint>) {
    return extractOut.assets.at(1).amount - this.extractIn.assets.at(1).amount;
  }

  lpReservesXOut(lpBoxOut: BoxCandidate<bigint>) {
    return lpBoxOut.value;
  }

  lpReservesYOut(lpBoxOut: BoxCandidate<bigint>) {
    return lpBoxOut.assets.at(2).amount;
  }

  lpRateXYOut(lpBoxOut: BoxCandidate<bigint>) {
    return this.lpReservesXOut(lpBoxOut) / this.lpReservesYOut(lpBoxOut);
  }

  validExtractAmount(lpBoxOut: BoxCandidate<bigint>) {
    return (
      this.oracleRate() * 97n < this.lpRateXYOut(lpBoxOut) * 100n &&
      this.oracleRate() * 98n > this.lpRateXYOut(lpBoxOut) * 100n
    );
  }

  validReleaseAmount(lpBoxOut: BoxCandidate<bigint>) {
    return this.oracleRate() * 101n > this.lpRateXYOut(lpBoxOut) * 100n;
  }

  validExtract(
    lpBoxOut: BoxCandidate<bigint>,
    bankBox: Box<bigint>,
    extractOut: BoxCandidate<bigint>,
  ) {
    return (
      this.deltaDexy(extractOut) > 0n &&
      this.validExtractAmount(lpBoxOut) &&
      this.validBankBox(bankBox)
    );
  }

  validRelease(
    extractOut: BoxCandidate<bigint>,
    lpBoxOut: BoxCandidate<bigint>,
  ) {
    return this.deltaDexy(extractOut) < 0n && this.validReleaseAmount(lpBoxOut);
  }

  validBankBox(bankBox: Box<bigint>) {
    return bankBox.value <= this.minBankNanoErgs;
  }

  validLpBox(lpBoxOut: BoxCandidate<bigint>, extractOut: BoxCandidate<bigint>) {
    return (
      this.lpReservesYOut(lpBoxOut) ===
        this.lpReservesY() - this.deltaDexy(extractOut) &&
      this.lpReservesXOut(lpBoxOut) === this.lpReservesX()
    );
  }
}

export { Extract };
