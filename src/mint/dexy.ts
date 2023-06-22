import type { ErgoBox, ErgoBoxCandidate } from "ergo-lib-wasm-browser";

abstract class Dexy {
    protected oracleBox
    protected lpBox
    protected readonly thresholdPercent = 101n
    private readonly buybackFeeNum = 2n
    private readonly feeDenom = 1000n
    private readonly bankFeeNum = 3n

    protected constructor(oracleBox: ErgoBox, lpBox: ErgoBox) {
        this.oracleBox = oracleBox
        this.lpBox = lpBox
    }

    bankRate() {
        const oracleRateWithoutFee = this.oracleRate()
        return oracleRateWithoutFee * (this.bankFeeNum + this.feeDenom) / this.feeDenom / 1000000n
    }

    ergNeededBankBox(mintValue: number): bigint {
        return BigInt(mintValue) * this.bankRate()
    }

    ergNeededBuyBackBox(mintValue: number): bigint {
        return BigInt(mintValue) * this.buybackRate()
    }

    ergNeeded(mintValue: number): bigint {
        return this.ergNeededBankBox(mintValue) + this.ergNeededBuyBackBox(mintValue)
    }

    dexyMinted(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate) {
        return BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(bankBoxOut.tokens().get(1).amount().as_i64().to_str())
    }

    lpReservesX() {
        return BigInt(this.lpBox.value().as_i64().to_str())
    }

    lpReservesY() {
        return BigInt(this.lpBox.tokens().get(2).amount().as_i64().to_str())
    }

    buybackErgsAdded(buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBoxCandidate) {
        return BigInt(buybackBoxOut.value().as_i64().to_str()) - BigInt(buybackBoxIn.value().as_i64().to_str())
    }

    bankErgsAdded(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate) {
        return BigInt(bankBoxOut.value().as_i64().to_str()) - BigInt(bankBoxIn.value().as_i64().to_str())
    }

    validBankDelta(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const ergsAdded = this.bankErgsAdded(bankBoxIn, bankBoxOut)
        const bankRate = this.bankRate()
        return ergsAdded >= dexyMinted * bankRate && ergsAdded > 0
    }

    oracleRateWithFee() {
        return this.bankRate() + this.buybackRate()
    }

    oracleRate() {
        return BigInt(this.oracleBox.register_value(4).to_js())
    }

    lpRate() {
        return this.lpReservesX() / this.lpReservesY()
    }

    buybackRate() {
        const oracleRateWithoutFee = this.oracleRate()
        return oracleRateWithoutFee * (this.buybackFeeNum) / this.feeDenom / 1000000n
    }

    validThreshold() {
        return this.lpRate() * 100n > this.thresholdPercent * this.oracleRateWithFee()
    }

    validRateFreeMint() {
        const oracleRateWithoutFee = this.oracleRate() / 1000000n
        const lpRate = this.lpRate()
        return 98n * lpRate < oracleRateWithoutFee * 100n && oracleRateWithoutFee * 100n < 102n * lpRate
    }
}

export { Dexy }
