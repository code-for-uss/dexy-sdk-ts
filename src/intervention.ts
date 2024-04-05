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

// TODO: Tested on chain but need to add unit test for this scenario
class Intervention extends Dexy {
  private readonly T_int = 20;
  private readonly interventionThresholdPercent = 98n;
  private readonly T = 360 // from paper, gap between two interventions
  protected bankIn: Box<bigint>;
  protected interventionIn: Box<bigint>;
  protected tracking98In: Box<bigint>;
  protected userBoxes: Box<bigint>[];
  protected user_address: ErgoAddress;
  protected HEIGHT: number;

  constructor(
    oracleBox: Box<Amount>,
    lpBox: Box<Amount>,
    bankInBox: Box<Amount>,
    interventionInBox: Box<Amount>,
    tracking98InBox: Box<Amount>,
    userInBoxes: Box<Amount>[],
    user_address: ErgoAddress,
    HEIGHT: number,
  ) {
    super(ensureUTxOBigInt(oracleBox), ensureUTxOBigInt(lpBox));
    this.bankIn = ensureUTxOBigInt(bankInBox);
    this.interventionIn = ensureUTxOBigInt(interventionInBox);
    this.tracking98In = ensureUTxOBigInt(tracking98InBox);
    this.userBoxes = userInBoxes.map((userBox) => ensureUTxOBigInt(userBox));
    this.user_address = user_address;
    this.HEIGHT = HEIGHT;
  }

  createInterventionTransaction(tx_fee: number): ErgoUnsignedTransaction {
    const erg_change = this.bankIn.value / 100n;
    const dexy_change = (erg_change * this.lpReservesY()) / this.lpReservesX();
    const inputs = new InputsCollection([
      this.lpBox,
      this.bankIn,
      this.interventionIn,
      ...this.userBoxes,
    ]);
    const outputs = new OutputsCollection();
    const userFund = this.userBoxes.reduce((a, b) => {
      return a + b.value;
    }, 0n);
    if (userFund < tx_fee) throw new Error("user fund is not enough");

    const lpOut = new OutputBuilder(
      this.lpReservesX() + erg_change,
      this.lpBox.ergoTree,
      this.HEIGHT,
    );
    lpOut.addTokens([this.lpBox.assets.at(0), this.lpBox.assets.at(1)]);
    lpOut.addTokens({
      tokenId: this.lpBox.assets.at(2).tokenId,
      amount: this.lpReservesY() - dexy_change,
    });
    outputs.add(lpOut);
    const lpOutBuild = lpOut.build();

    const bankBoxOut = new OutputBuilder(
      this.bankIn.value - erg_change,
      this.bankIn.ergoTree,
      this.HEIGHT,
    );
    bankBoxOut.addTokens(this.bankIn.assets.at(0));
    bankBoxOut.addTokens({
      tokenId: this.bankIn.assets.at(1).tokenId,
      amount: this.bankIn.assets.at(1).amount + dexy_change,
    });
    outputs.add(bankBoxOut);
    const bankBoxOutBuild = bankBoxOut.build();

    const interventionOut = new OutputBuilder(
      this.interventionIn.value,
      this.interventionIn.ergoTree,
      this.HEIGHT,
    );
    interventionOut.addTokens(this.interventionIn.assets);
    outputs.add(interventionOut);

    if (!this.validGap()) throw new Error("Gap condition is false");
    if (!this.validThreshold()) throw new Error("Threshold is not valid");
    else if (!this.validTracking(this.tracking98In, this.HEIGHT))
      throw new Error("Tracking is not valid");
    else if (!this.validMaxSpending(lpOutBuild, this.bankIn, bankBoxOutBuild))
      throw new Error("Max spending is not valid");
    else if (!this.validDeltas(lpOutBuild, this.bankIn, bankBoxOutBuild))
      throw new Error("Deltas is not valid");

    return new TransactionBuilder(this.HEIGHT)
      .from(inputs)
      .to(outputs.toArray())
      .sendChangeTo(this.user_address)
      .withDataFrom([this.oracleBox, this.tracking98In])
      .payFee(tx_fee.toString())
      .build();
  }

  deltaLpX(lpBoxOut: BoxCandidate<bigint>) {
    return this.lpReservesXOut(lpBoxOut) - this.lpReservesX();
  }

  deltaLpY(lpBoxOut: BoxCandidate<bigint>) {
    return this.lpReservesY() - this.lpReservesYOut(lpBoxOut);
  }

  deltaBankErgs(bankBoxIn: Box<bigint>, bankBoxOut: BoxCandidate<bigint>) {
    return bankBoxIn.value - bankBoxOut.value;
  }

  deltaBankTokens(bankBoxIn: Box<bigint>, bankBoxOut: BoxCandidate<bigint>) {
    return bankBoxOut.assets.at(1).amount - bankBoxIn.assets.at(1).amount;
  }

  lpReservesXOut(lpBoxOut: BoxCandidate<bigint>) {
    return lpBoxOut.value;
  }

  lpReservesYOut(lpBoxOut: BoxCandidate<bigint>) {
    return lpBoxOut.assets.at(2).amount;
  }

  validThreshold() {
    return (
      this.lpReservesX() * 100n <
      this.oracleRate() * this.interventionThresholdPercent * this.lpReservesY()
    );
  }

  validGap() {
    return (
        this.interventionIn.creationHeight < this.HEIGHT - this.T
    );
  }

  validTracking(trackingBox: Box<bigint>, HEIGHT: number) {
    return (
      SConstant.from<number>(trackingBox.additionalRegisters.R7).data <
      HEIGHT - this.T_int
    );
  }

  validMaxSpending(
    lpBoxOut: BoxCandidate<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
  ) {
    return (
      this.lpReservesXOut(lpBoxOut) * 1000n <=
        this.oracleRate() * this.lpReservesYOut(lpBoxOut) * 995n &&
      this.deltaBankErgs(bankBoxIn, bankBoxOut) <= bankBoxIn.value
    );
  }

  validDeltas(
    lpBoxOut: BoxCandidate<bigint>,
    bankBoxIn: Box<bigint>,
    bankBoxOut: BoxCandidate<bigint>,
  ) {
    return (
      this.deltaBankErgs(bankBoxIn, bankBoxOut) <= this.deltaLpX(lpBoxOut) &&
      this.deltaBankTokens(bankBoxIn, bankBoxOut) >= this.deltaLpY(lpBoxOut) &&
      this.deltaLpX(lpBoxOut) > 0n
    );
  }
}

export { Intervention };
