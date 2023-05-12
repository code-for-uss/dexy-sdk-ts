import { RustModule } from "@ergolabs/ergo-sdk";
import type {
    Address,
    ErgoBox,
    ErgoBoxes,
    NetworkPrefix
} from "ergo-lib-wasm-browser";
import { DexyUnsignedTX } from "../models/interfaces";

class FreeMint {
    private readonly networkPrefix: NetworkPrefix
    private readonly T_free = 100n
    private readonly T_buffer = 5n
    private readonly bankFeeNum = 3n
    private readonly buybackFeeNum = 2n
    private readonly feeDenom = 1000n

    constructor(networkPrefix: NetworkPrefix = RustModule.SigmaRust.NetworkPrefix.Mainnet) {
        this.networkPrefix = networkPrefix
    }

    createFreeMintTransaction(tx_fee: number, mintValue: number, freeMintIn: ErgoBox, buybackBoxIn: ErgoBox, bankBoxIn: ErgoBox, userBoxes: ErgoBoxes, lpBox: ErgoBox, user_address: Address, oracleBox: ErgoBox, HEIGHT: number): DexyUnsignedTX {
        const availableToMint = this.availableToMint(freeMintIn, lpBox, HEIGHT)
        if (mintValue > availableToMint)
            return undefined
        else {
            const inputs = RustModule.SigmaRust.ErgoBoxes.empty()
            inputs.add(freeMintIn)
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
            const freeMintOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
                freeMintIn.value(),
                RustModule.SigmaRust.Contract.new(freeMintIn.ergo_tree()),
                HEIGHT
            )
            freeMintOut.set_register_value(4, !this.isCounterReset(freeMintIn, HEIGHT) ? freeMintIn.register_value(4) : RustModule.SigmaRust.Constant.from_i32(Number(BigInt(HEIGHT) + this.T_free + this.T_buffer)))
            freeMintOut.set_register_value(5, RustModule.SigmaRust.Constant.from_i64(RustModule.SigmaRust.I64.from_str((availableToMint - BigInt(mintValue)).toString())))
            for (let i = 0; i < freeMintIn.tokens().len(); i++) {
                freeMintOut.add_token(freeMintIn.tokens().get(i).id(), freeMintIn.tokens().get(i).amount())
                target_tokens.add(new RustModule.SigmaRust.Token(freeMintIn.tokens().get(i).id(), freeMintIn.tokens().get(i).amount()))
            }
            outputs.add(freeMintOut.build())
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
            tx_builder.set_data_inputs(data_inputs);

            const data_inputs_ergoBoxes = RustModule.SigmaRust.ErgoBoxes.empty()
            data_inputs_ergoBoxes.add(oracleBox)
            data_inputs_ergoBoxes.add(lpBox)

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

    // TODO: transaction as input
    transactionValidator(oracleBox: ErgoBox, freeMintIn: ErgoBox, freeMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBox, HEIGHT: number) {
        return this.validSuccessor(freeMintIn, freeMintOut, lpBox, bankBoxIn, bankBoxOut, HEIGHT) && this.validDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut, oracleBox) && this.validRateFreeMint(oracleBox, lpBox) && this.validAmount(lpBox, bankBoxIn, bankBoxOut, freeMintIn, HEIGHT)
    }
    // checked
    validRateFreeMint(oracleBox: ErgoBox, lpBox: ErgoBox) {
        const oracleRateWithoutFee = this.oracleRate(oracleBox) / 1000000n
        // check
        const lpReservesX = this.lpReservesX(lpBox)
        const lpReservesY = this.lpReservesY(lpBox)
        const lpRate = lpReservesX / lpReservesY
        return 98n * lpRate < oracleRateWithoutFee * 100n && oracleRateWithoutFee * 100n < 102n * lpRate
    }
    //checked
    validBankDelta(oracleBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const ergsAdded = BigInt(bankBoxOut.value().as_i64().to_str()) - BigInt(bankBoxIn.value().as_i64().to_str())
        const bankRate = this.bankRate(oracleBox)
        return ergsAdded >= dexyMinted * bankRate && ergsAdded > 0
    }
    //checked
    bankRate(oracleBox: ErgoBox) {
        const oracleRateWithoutFee = this.oracleRate(oracleBox)
        return oracleRateWithoutFee * (this.bankFeeNum + this.feeDenom) / this.feeDenom / 1000000n
    }

    oracleRate(oracleBox: ErgoBox) {
        return BigInt(oracleBox.register_value(4).to_js())
    }

    // checked
    dexyMinted(bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        return BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(bankBoxOut.tokens().get(1).amount().as_i64().to_str())
    }

    lpReservesX(lpBox: ErgoBox) {
        return BigInt(lpBox.value().as_i64().to_str())
    }

    lpReservesY(lpBox: ErgoBox) {
        return BigInt(lpBox.tokens().get(2).amount().as_i64().to_str())
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
    validAmount(lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, freeMintIn: ErgoBox, HEIGHT: number) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const availableToMint = this.availableToMint(freeMintIn, lpBox, HEIGHT)
        return dexyMinted <= availableToMint
    }

    isCounterReset(freeMintIn: ErgoBox, HEIGHT: number) {
        return BigInt(HEIGHT) > BigInt(freeMintIn.register_value(4).to_js())
    }

    maxAllowedIfReset(lpBox: ErgoBox){
        return this.lpReservesY(lpBox) / 100n
    }

    availableToMint(freeMintIn: ErgoBox, lpBox: ErgoBox, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT)
        return isCounterReset ? this.maxAllowedIfReset(lpBox) : BigInt(freeMintIn.register_value(5).to_js())
    }

    validSuccessorR4(freeMintIn: ErgoBox, freeMintOut: ErgoBox, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT)
        if (isCounterReset) {
            return freeMintOut.register_value(4).encode_to_base16() === freeMintIn.register_value(4).encode_to_base16()
        } else {
            return BigInt(freeMintOut.register_value(4).to_js()) >= BigInt(HEIGHT) + this.T_free && BigInt(freeMintOut.register_value(4).to_js()) <= BigInt(HEIGHT) + this.T_free + this.T_buffer
        }
    }

    validSuccessorR5(freeMintIn: ErgoBox, freeMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, HEIGHT: number) {
        return BigInt(freeMintOut.register_value(5).to_js()) === this.availableToMint(freeMintIn, lpBox, HEIGHT) - this.dexyMinted(bankBoxIn, bankBoxOut)
    }

    validSuccessor(freeMintIn: ErgoBox, freeMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, HEIGHT: number) {
        return freeMintOut.ergo_tree().to_base16_bytes() === freeMintIn.ergo_tree().to_base16_bytes() && BigInt(freeMintOut.value().as_i64().to_str()) >= BigInt(freeMintIn.value().as_i64().to_str()) && this.validSuccessorR4(freeMintIn, freeMintOut, HEIGHT) && this.validSuccessorR5(freeMintIn, freeMintOut, lpBox, bankBoxIn, bankBoxOut, HEIGHT)
    }
}

export { FreeMint }
