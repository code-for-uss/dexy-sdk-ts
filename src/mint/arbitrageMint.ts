import { RustModule } from "@ergolabs/ergo-sdk";
import {
    NetworkPrefix,
    ErgoBox,
    ErgoBoxes,
    Address,
    UnsignedTransaction,
} from "ergo-lib-wasm-browser";

class ArbitrageMint {
    private readonly networkPrefix: NetworkPrefix
    private readonly T_arb = 30n
    private readonly T_buffer = 5n
    private readonly bankFeeNum = 3n
    private readonly buybackFeeNum = 2n
    private readonly feeDenom = 1000n
    private readonly thresholdPercent = 101n

    constructor(networkPrefix: NetworkPrefix = RustModule.SigmaRust.NetworkPrefix.Mainnet) {
        this.networkPrefix = networkPrefix
    }

    createArbitrageMintTransaction(tx_fee: number, mintValue: number, arbitrageMintIn: ErgoBox, buybackBoxIn: ErgoBox, bankBoxIn: ErgoBox, userBoxes: ErgoBoxes, lpBox: ErgoBox, user_address: Address, oracleBox: ErgoBox, tracking101Box:ErgoBox, HEIGHT: number): { tx: UnsignedTransaction, dataInputs: ErgoBoxes, inputs: ErgoBoxes } {
        const availableToMint = this.availableToMint(arbitrageMintIn, lpBox, oracleBox, HEIGHT)
        if (mintValue > availableToMint)
            return undefined
        else {
            const inputs = RustModule.SigmaRust.ErgoBoxes.empty()
            inputs.add(arbitrageMintIn)
            inputs.add(bankBoxIn)
            inputs.add(buybackBoxIn)
            let userFund = 0n
            for (let i = 0; i < userBoxes.len(); i++) {
                inputs.add(userBoxes.get(i));
                userFund += BigInt(userBoxes.get(i).value().as_i64().to_str())
            }
            if (userFund < this.ergNeeded(mintValue, oracleBox))
                return undefined
            const target_tokens = new RustModule.SigmaRust.Tokens()
            const outputs = RustModule.SigmaRust.ErgoBoxCandidates.empty();
            const arbitrageMintOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
                arbitrageMintIn.value(),
                RustModule.SigmaRust.Contract.new(arbitrageMintIn.ergo_tree()),
                HEIGHT
            )
            arbitrageMintOut.set_register_value(4, !this.isCounterReset(arbitrageMintIn, HEIGHT) ? arbitrageMintIn.register_value(4) : RustModule.SigmaRust.Constant.from_i32(Number(BigInt(HEIGHT) + this.T_arb + this.T_buffer)))
            arbitrageMintOut.set_register_value(5, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str((availableToMint - BigInt(mintValue)).toString())))
            for (let i = 0; i < arbitrageMintIn.tokens().len(); i++) {
                arbitrageMintOut.add_token(arbitrageMintIn.tokens().get(i).id(), arbitrageMintIn.tokens().get(i).amount())
                target_tokens.add(new RustModule.SigmaRust.Token(arbitrageMintIn.tokens().get(i).id(), arbitrageMintIn.tokens().get(i).amount()))
            }
            outputs.add(arbitrageMintOut.build())

            const bankBoxOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
                RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.value().as_i64().to_str()) + this.ergNeededBankBox(mintValue, oracleBox)).toString())),
                RustModule.SigmaRust.Contract.new(bankBoxIn.ergo_tree()),
                HEIGHT
            )
            bankBoxOut.add_token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount())
            bankBoxOut.add_token(bankBoxIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(mintValue)).toString())))
            target_tokens.add(new RustModule.SigmaRust.Token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount()))
            target_tokens.add(new RustModule.SigmaRust.Token(bankBoxIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(mintValue)).toString()))))
            outputs.add(bankBoxOut.build())

            const buybackBoxOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
                RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(buybackBoxIn.value().as_i64().to_str()) + this.ergNeededBuyBackBox(mintValue, oracleBox)).toString())),
                RustModule.SigmaRust.Contract.new(buybackBoxIn.ergo_tree()),
                HEIGHT
            )
            buybackBoxOut.add_token(buybackBoxIn.tokens().get(0).id(), buybackBoxIn.tokens().get(0).amount())
            target_tokens.add(new RustModule.SigmaRust.Token(buybackBoxIn.tokens().get(0).id(), buybackBoxIn.tokens().get(0).amount()))
            outputs.add(buybackBoxOut.build())

            const target_output_selector = new RustModule.SigmaRust.SimpleBoxSelector()
            const target_outputs = target_output_selector.select(
                inputs,
                RustModule.SigmaRust.BoxValue.from_i64(
                    RustModule.SigmaRust.I64.from_str((
                        BigInt(tx_fee) +
                        BigInt(outputs.get(0).value().as_i64().as_num()) +
                        BigInt(outputs.get(1).value().as_i64().as_num()) +
                        BigInt(outputs.get(2).value().as_i64().as_num())
                    ).toString())),
                target_tokens)

            const tx_builder = RustModule.SigmaRust.TxBuilder.new(
                new RustModule.SigmaRust.BoxSelection(inputs, target_outputs.change()),
                outputs,
                HEIGHT,
                RustModule.SigmaRust.BoxValue.from_i64(
                    RustModule.SigmaRust.I64.from_str(tx_fee.toString())
                ),
                user_address
            )
            const data_inputs = new RustModule.SigmaRust.DataInputs();
            data_inputs.add(new RustModule.SigmaRust.DataInput(oracleBox.box_id()));
            data_inputs.add(new RustModule.SigmaRust.DataInput(lpBox.box_id()));
            data_inputs.add(new RustModule.SigmaRust.DataInput(tracking101Box.box_id()));
            tx_builder.set_data_inputs(data_inputs);

            const data_inputs_ergoBoxes = RustModule.SigmaRust.ErgoBoxes.empty()
            data_inputs_ergoBoxes.add(oracleBox)
            data_inputs_ergoBoxes.add(lpBox)
            data_inputs_ergoBoxes.add(tracking101Box)

            const contextExtension = new RustModule.SigmaRust.ContextExtension()
            contextExtension.set_pair(0, RustModule.SigmaRust.Constant.from_js(1))
            tx_builder.set_context_extension(buybackBoxIn.box_id(), contextExtension)

            return {
                tx:tx_builder.build(),
                dataInputs: data_inputs_ergoBoxes,
                inputs: inputs
            }
        }
    }

    ergNeededBankBox(mintValue: number, oracleBox: ErgoBox): bigint {
        return BigInt(mintValue) * this.bankRate(oracleBox)
    }

    ergNeededBuyBackBox(mintValue: number, oracleBox: ErgoBox): bigint {
        return BigInt(mintValue) * this.buybackRate(oracleBox)
    }

    ergNeeded(mintValue: number, oracleBox: ErgoBox): bigint {
        return this.ergNeededBankBox(mintValue, oracleBox) + this.ergNeededBuyBackBox(mintValue, oracleBox)
    }

    // // TODO: transaction as input
    transactionValidator(oracleBox: ErgoBox, arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBox, tracking101Box: ErgoBox, HEIGHT: number) {
        return this.validSuccessor(arbitrageMintIn, arbitrageMintOut, lpBox, bankBoxIn, bankBoxOut, oracleBox, HEIGHT) && this.validDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut, oracleBox) && this.validAmount(lpBox, bankBoxIn, bankBoxOut, arbitrageMintIn, oracleBox, HEIGHT) && this.validDelay(tracking101Box, HEIGHT) && this.validThreshold(lpBox,oracleBox)
    }

    validDelay(tracking101Box: ErgoBox, HEIGHT: number){
        return BigInt(tracking101Box.register_value(7).to_i64().to_str()) < BigInt(HEIGHT) - this.T_arb
    }
    validThreshold(lpBox:ErgoBox, oracleBox: ErgoBox){
        return this.lpRate(lpBox) * 100n > this.thresholdPercent * this.oracleRateWithFee(oracleBox)
    }

    oracleRateWithFee(oracleBox: ErgoBox) {
        return this.bankRate(oracleBox) + this.buybackRate(oracleBox)
    }

    oracleRate(oracleBox: ErgoBox) {
        return BigInt(oracleBox.register_value(4).to_js())
    }

    dexyMinted(bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        return BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(bankBoxOut.tokens().get(1).amount().as_i64().to_str())
    }
    bankErgsAdded(bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        return BigInt(bankBoxOut.value().as_i64().to_str()) - BigInt(bankBoxIn.value().as_i64().to_str())
    }
    validBankDelta(oracleBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const ergsAdded = this.bankErgsAdded(bankBoxIn, bankBoxOut)
        const bankRate = this.bankRate(oracleBox)
        return ergsAdded >= dexyMinted * bankRate && ergsAdded > 0
    }
    //checked
    bankRate(oracleBox: ErgoBox) {
        const oracleRateWithoutFee = this.oracleRate(oracleBox)
        return oracleRateWithoutFee * (this.bankFeeNum + this.feeDenom) / this.feeDenom / 1000000n
    }

    lpReservesX(lpBox: ErgoBox) {
        return BigInt(lpBox.value().as_i64().to_str())
    }

    lpReservesY(lpBox: ErgoBox) {
        return BigInt(lpBox.tokens().get(2).amount().as_i64().to_str())
    }

    lpRate(lpBox: ErgoBox) {
        return this.lpReservesX(lpBox) / this.lpReservesY(lpBox)
    }

    buybackErgsAdded(buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBox) {
        return BigInt(buybackBoxOut.value().as_i64().to_str()) - BigInt(buybackBoxIn.value().as_i64().to_str())
    }

    buybackRate(oracleBox: ErgoBox) {
        const oracleRateWithoutFee = this.oracleRate(oracleBox)
        return oracleRateWithoutFee * (this.buybackFeeNum) / this.feeDenom / 1000000n
    }

    validBuybackDelta(bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBox, oracleBox: ErgoBox){
        return this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) >= this.dexyMinted(bankBoxIn, bankBoxOut) * this.buybackRate(oracleBox) && this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) > 0
    }

    validDelta(bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBox, oracleBox: ErgoBox){
        return this.validBankDelta(oracleBox, bankBoxIn, bankBoxOut) && this.validBuybackDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut, oracleBox)
    }

    validAmount(lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, arbitrageMintIn: ErgoBox, oracleBox: ErgoBox, HEIGHT: number) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const availableToMint = this.availableToMint(arbitrageMintIn, lpBox, oracleBox, HEIGHT)
        return dexyMinted <= availableToMint
    }

    isCounterReset(arbitrageMintIn: ErgoBox, HEIGHT: number) {
        return BigInt(HEIGHT) > BigInt(arbitrageMintIn.register_value(4).to_js())
    }
    maxAllowedIfReset(lpBox: ErgoBox, oracleBox: ErgoBox) {
        return (this.lpReservesX(lpBox) - this.oracleRateWithFee(oracleBox) * this.lpReservesY(lpBox)) / this.oracleRateWithFee(oracleBox)
    }
    availableToMint(freeMintIn: ErgoBox, lpBox: ErgoBox, oracleBox: ErgoBox, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT)
        return isCounterReset ? this.maxAllowedIfReset(lpBox, oracleBox) : BigInt(freeMintIn.register_value(5).to_js())
    }


    validSuccessorR4(arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBox, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(arbitrageMintIn, HEIGHT)
        if (!isCounterReset) {
            return arbitrageMintOut.register_value(4).encode_to_base16() === arbitrageMintIn.register_value(4).encode_to_base16()
        } else {
            return BigInt(arbitrageMintOut.register_value(4).to_js()) >= BigInt(HEIGHT) + this.T_arb && BigInt(arbitrageMintOut.register_value(4).to_js()) <= BigInt(HEIGHT) + this.T_arb + this.T_buffer
        }
    }

    validSuccessorR5(arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, oracleBox: ErgoBox, HEIGHT: number) {
        return BigInt(arbitrageMintOut.register_value(5).to_js()) === this.availableToMint(arbitrageMintIn, lpBox, oracleBox, HEIGHT) - this.dexyMinted(bankBoxIn, bankBoxOut)
    }

    validSuccessor(arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, oracleBox: ErgoBox,HEIGHT: number) {
        return arbitrageMintOut.ergo_tree().to_base16_bytes() === arbitrageMintIn.ergo_tree().to_base16_bytes() && BigInt(arbitrageMintOut.value().as_i64().to_str()) >= BigInt(arbitrageMintIn.value().as_i64().to_str()) && this.validSuccessorR4(arbitrageMintIn, arbitrageMintOut, HEIGHT) && this.validSuccessorR5(arbitrageMintIn, arbitrageMintOut, lpBox, bankBoxIn, bankBoxOut, oracleBox, HEIGHT)
    }
}

export { ArbitrageMint }
