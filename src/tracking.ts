import { Amount, Box, BoxCandidate, ensureUTxOBigInt } from "@fleet-sdk/common";
import {
  ErgoAddress,
  ErgoUnsignedTransaction,
  InputsCollection,
  OutputBuilder,
  OutputsCollection,
  TransactionBuilder,
} from "@fleet-sdk/core";
import { SConstant } from "@fleet-sdk/serializer";
import { Dexy } from "./mint/dexy";
import { SInt } from "@fleet-sdk/serializer";

// TODO: should be test
class Tracking extends Dexy {
  private readonly threshold = 3;
  private readonly maxInt = 2147483647;
  protected trackingIn: Box<bigint>;
  protected userBoxes: Box<bigint>[];
  protected user_address: ErgoAddress;
  protected HEIGHT: number;

  constructor(
    oracleBox: Box<Amount>,
    lpBox: Box<Amount>,
    trackingInBox: Box<Amount>,
    userInBoxes: Box<Amount>[],
    user_address: ErgoAddress,
    HEIGHT: number,
  ) {
    super(ensureUTxOBigInt(oracleBox), ensureUTxOBigInt(lpBox));
    this.trackingIn = ensureUTxOBigInt(trackingInBox);
    this.userBoxes = userInBoxes.map((userBox) => ensureUTxOBigInt(userBox));
    this.user_address = user_address;
    this.HEIGHT = HEIGHT;
  }

  createTrackingTransaction(tx_fee: number): ErgoUnsignedTransaction {
    const inputs = new InputsCollection([this.trackingIn, ...this.userBoxes]);
    const outputs = new OutputsCollection();
    const userFund = this.userBoxes.reduce((a, b) => {
      return a + b.value;
    }, 0n);
    if (userFund < tx_fee) throw new Error("user fund is not enough");

    const trackingBoxOut = new OutputBuilder(
      this.trackingIn.value,
      this.trackingIn.ergoTree,
      this.HEIGHT,
    );
    trackingBoxOut.addTokens(this.trackingIn.assets.at(0));
    // TODO: check possibility of use registers directly or need to parse and use it again
    trackingBoxOut.setAdditionalRegisters({
      R4: this.trackingIn.additionalRegisters.R4,
      R5: this.trackingIn.additionalRegisters.R5,
      R6: this.trackingIn.additionalRegisters.R6,
      R7:
        SConstant.from<number>(this.trackingIn.additionalRegisters.R7).data ===
        this.maxInt
          ? SInt(this.HEIGHT)
          : SInt(this.maxInt),
    });
    const trackingBoxOutBuild = trackingBoxOut.build();
    outputs.add(trackingBoxOut);

    if (!this.correctAction(trackingBoxOutBuild, this.HEIGHT))
      throw new Error("Invalid action");
    else if (this.numOut(trackingBoxOutBuild) !== this.numIn())
      throw new Error("Invalid numOut");
    else if (this.denomOut(trackingBoxOutBuild) !== this.denomIn())
      throw new Error("Invalid denomOut");
    else if (this.isBelowOut(trackingBoxOutBuild) !== this.isBelowIn())
      throw new Error("Invalid isBelowOut");

    return new TransactionBuilder(this.HEIGHT)
      .from(inputs)
      .to(outputs.toArray())
      .sendChangeTo(this.user_address)
      .withDataFrom([this.oracleBox, this.lpBox])
      .payFee(tx_fee.toString())
      .build();
  }

  numOut(trackingOut: BoxCandidate<bigint>) {
    return SConstant.from<bigint>(trackingOut.additionalRegisters.R4).data;
  }

  numIn() {
    return SConstant.from<bigint>(this.trackingIn.additionalRegisters.R4).data;
  }

  denomOut(trackingOut: BoxCandidate<bigint>) {
    return SConstant.from<bigint>(trackingOut.additionalRegisters.R5).data;
  }

  denomIn() {
    return SConstant.from<bigint>(this.trackingIn.additionalRegisters.R5).data;
  }

  isBelowOut(trackingOut: BoxCandidate<bigint>): boolean {
    return SConstant.from<boolean>(trackingOut.additionalRegisters.R6).data;
  }

  isBelowIn(): boolean {
    return SConstant.from<boolean>(this.trackingIn.additionalRegisters.R6).data;
  }

  correctAction(trackingOut: BoxCandidate<bigint>, HEIGHT: number) {
    const x = this.lpRate() * this.denomIn();
    const y = this.numIn() * this.oracleRate();
    const trackingHeightIn = SConstant.from<number>(
      this.trackingIn.additionalRegisters.R7,
    ).data;
    const trackingHeightOut = SConstant.from<number>(
      trackingOut.additionalRegisters.R7,
    ).data;
    const notTriggeredEarlier = trackingHeightIn === this.maxInt;
    const triggeredNow =
      trackingHeightOut >= HEIGHT - this.threshold &&
      trackingHeightOut <= HEIGHT;

    const notResetEarlier = trackingHeightIn < this.maxInt;
    const resetNow = trackingHeightOut === this.maxInt;

    const trigger =
      ((this.isBelowIn() && x < y) || (!this.isBelowIn() && x > y)) &&
      notTriggeredEarlier &&
      triggeredNow;
    const reset =
      ((this.isBelowIn() && x >= y) || (!this.isBelowIn() && x <= y)) &&
      notResetEarlier &&
      resetNow;
    return trigger || reset;
  }
}

export { Tracking };
