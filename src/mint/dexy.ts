import { Box } from "@fleet-sdk/common";
import { ensureUTxOBigInt, BoxCandidate } from "@fleet-sdk/common";
import { parse } from "@fleet-sdk/serializer";

abstract class Dexy {
  protected oracleBox: Box<bigint>;
  protected lpBox: Box<bigint>;
  protected readonly thresholdPercent = 101n;
  private readonly buybackFeeNum = 2n;
  private readonly feeDenom = 1000n;
  private readonly bankFeeNum = 3n;

  protected constructor(oracleBox: Box<bigint>, lpBox: Box<bigint>) {
    this.oracleBox = oracleBox;
    this.lpBox = lpBox;
  }

  bankRate() {
    const oracleRateWithoutFee = this.oracleRate();
    return (
      (oracleRateWithoutFee * (this.bankFeeNum + this.feeDenom)) / this.feeDenom
    );
  }

  ergNeededBankBox(mintValue: number): bigint {
    return BigInt(mintValue) * this.bankRate();
  }

  ergNeededBuyBackBox(mintValue: number): bigint {
    return BigInt(mintValue) * this.buybackRate();
  }

  ergNeeded(mintValue: number): bigint {
    return (
      this.ergNeededBankBox(mintValue) + this.ergNeededBuyBackBox(mintValue)
    );
  }

  dexyMinted(bankBoxIn: Box<bigint>, bankBoxOut: BoxCandidate<bigint>) {
    const bankDexyIn = ensureUTxOBigInt(bankBoxIn).assets.at(1).amount;
    const bankDexyOut = ensureUTxOBigInt(bankBoxOut).assets.at(1).amount;
    return bankDexyIn - bankDexyOut;
  }

  lpReservesX() {
    return this.lpBox.value;
  }

  lpReservesY() {
    return this.lpBox.assets.at(2).amount;
  }

  buybackErgsAdded(
    buybackBoxIn: Box<bigint>,
    buybackBoxOut: BoxCandidate<bigint>,
  ) {
    return buybackBoxOut.value - buybackBoxIn.value;
  }

  bankErgsAdded(bankBoxIn: Box<bigint>, bankBoxOut: BoxCandidate<bigint>) {
    return bankBoxOut.value - bankBoxIn.value;
  }

  validBankDelta(bankBoxIn: Box<bigint>, bankBoxOut: BoxCandidate<bigint>) {
    const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut);
    const ergsAdded = this.bankErgsAdded(bankBoxIn, bankBoxOut);
    const bankRate = this.bankRate();
    return ergsAdded >= dexyMinted * bankRate && ergsAdded > 0;
  }

  oracleRateWithFee() {
    return this.bankRate() + this.buybackRate();
  }

  oracleRate() {
    return parse<bigint>(this.oracleBox.additionalRegisters.R4) / 1000000n;
  }

  lpRate() {
    return this.lpReservesX() / this.lpReservesY();
  }

  buybackRate() {
    const oracleRateWithoutFee = this.oracleRate();
    return (oracleRateWithoutFee * this.buybackFeeNum) / this.feeDenom;
  }

  validThreshold() {
    return (
      this.lpRate() * 100n > this.thresholdPercent * this.oracleRateWithFee()
    );
  }

  validRateFreeMint() {
    const oracleRateWithoutFee = this.oracleRate();
    const lpRate = this.lpRate();
    return oracleRateWithoutFee * 98n < lpRate * 100n;
  }
}

export { Dexy };
