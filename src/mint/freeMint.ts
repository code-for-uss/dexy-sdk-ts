import {
    NetworkPrefix,
    ErgoBox,
    TxBuilder,
    BoxSelection,
    ErgoBoxes,
    BoxValue,
    I64,
    Address,
    DataInputs,
    DataInput,
    Contract,
    ErgoBoxCandidateBuilder,
    Constant,
    ErgoBoxCandidates, TokenAmount, SimpleBoxSelector, Tokens, Token, ErgoTree
} from "ergo-lib-wasm-browser";

import { IMPLEMENTOR } from "../utils/const";

class FreeMint {
    private readonly networkPrefix: NetworkPrefix
    private readonly T_free = 100n
    private readonly T_buffer = 5n
    private readonly feeNum = 10n
    private readonly feeDenom = 1000n

    constructor(networkPrefix: NetworkPrefix = NetworkPrefix.Mainnet) {
        this.networkPrefix = networkPrefix
    }

    createFreeMintTransaction(tx_fee: number, mintValue: number, freeMintIn: ErgoBox, bankBoxIn: ErgoBox, userBoxes: ErgoBoxes, lpBox: ErgoBox, user_address: Address, oracleBox: ErgoBox, HEIGHT: number) {
        const availableToMint = this.availableToMint(freeMintIn, lpBox, HEIGHT)
        if (mintValue > availableToMint)
            return undefined
        else {
            const inputs = ErgoBoxes.empty()
            inputs.add(freeMintIn)
            inputs.add(bankBoxIn)
            for (let i = 0; i < userBoxes.len(); i++) {
                inputs.add(userBoxes.get(i));
            }
            const target_tokens = new Tokens()
            const outputs = ErgoBoxCandidates.empty();
            const freeMintOut = new ErgoBoxCandidateBuilder(
                freeMintIn.value(),
                Contract.new(freeMintIn.ergo_tree()),
                HEIGHT
            )
            freeMintOut.set_register_value(4, !this.isCounterReset(freeMintIn, HEIGHT) ? freeMintIn.register_value(4) : Constant.from_i64(I64.from_str((HEIGHT + 3).toString())))
            freeMintOut.set_register_value(5, Constant.from_i64(I64.from_str((availableToMint - BigInt(mintValue)).toString())))
            for (let i = 0; i < freeMintIn.tokens().len(); i++) {
                freeMintOut.add_token(freeMintIn.tokens().get(i).id(), freeMintIn.tokens().get(i).amount())
                target_tokens.add(new Token(freeMintIn.tokens().get(i).id(), freeMintIn.tokens().get(i).amount()))
            }
            outputs.add(freeMintOut.build())

            const bankBoxOut = new ErgoBoxCandidateBuilder(
                BoxValue.from_i64(I64.from_str((BigInt(bankBoxIn.value().as_i64().to_str()) + this.ergNeededWithoutFee(mintValue, oracleBox)).toString())),
                Contract.new(bankBoxIn.ergo_tree()),
                HEIGHT
            )
            bankBoxOut.add_token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount())
            bankBoxOut.add_token(bankBoxIn.tokens().get(1).id(), TokenAmount.from_i64(I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(mintValue)).toString())))
            target_tokens.add(new Token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount()))
            target_tokens.add(new Token(bankBoxIn.tokens().get(1).id(), TokenAmount.from_i64(I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(mintValue)).toString()))))
            outputs.add(bankBoxOut.build())

            const fee_implementor = this.implementorFee(mintValue, oracleBox)
            const implementorBoxOut = new ErgoBoxCandidateBuilder(
                BoxValue.from_i64(I64.from_str((fee_implementor).toString())),
                Contract.new(ErgoTree.from_base16_bytes(IMPLEMENTOR.address)),
                HEIGHT
            )
            outputs.add(implementorBoxOut.build())

            const target_output_selector = new SimpleBoxSelector()
            const target_outputs = target_output_selector.select(
                inputs,
                BoxValue.from_i64(
                    I64.from_str((
                        BigInt(tx_fee) +
                        BigInt(fee_implementor) +
                        BigInt(outputs.get(0).value().as_i64().as_num()) +
                        BigInt(outputs.get(1).value().as_i64().as_num())
                    ).toString())),
                target_tokens)

            const tx_builder = TxBuilder.new(
                new BoxSelection(inputs, target_outputs.change()),
                outputs,
                HEIGHT,
                BoxValue.from_i64(
                    I64.from_str(tx_fee.toString())
                ),
                user_address
            )
            const data_inputs = new DataInputs();
            data_inputs.add(new DataInput(oracleBox.box_id()));
            data_inputs.add(new DataInput(lpBox.box_id()));
            tx_builder.set_data_inputs(data_inputs);

            const data_inputs_ergoBoxes = ErgoBoxes.empty()
            data_inputs_ergoBoxes.add(oracleBox)
            data_inputs_ergoBoxes.add(lpBox)

            return {
                tx:tx_builder.build(),
                dataInputs: data_inputs_ergoBoxes,
                inputs: inputs
            }
        }
    }

    private ergNeededWithoutFee(mintValue: number, oracleBox: ErgoBox): bigint {
        return BigInt(mintValue) * this.oracleRateWithFee(oracleBox)
    }

    private implementorFee(mintValue: number, oracleBox: ErgoBox): bigint {
        return this.ergNeededWithoutFee(mintValue, oracleBox) * IMPLEMENTOR.fee_per / BigInt(1e4)
    }

    ergNeeded(mintValue: number, oracleBox: ErgoBox): bigint {
        return BigInt(mintValue) * this.oracleRateWithFee(oracleBox) * (IMPLEMENTOR.fee_per + BigInt(1))  / BigInt(1e4)
    }

    transactionValidator(oracleBox: ErgoBox, freeMintIn: ErgoBox, freeMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, HEIGHT: number) {
        return this.validSuccessor(freeMintIn, freeMintOut, lpBox, bankBoxIn, bankBoxOut, HEIGHT) && this.validDelta(oracleBox, bankBoxIn, bankBoxOut) && this.validRateFreeMint(oracleBox, lpBox) && this.validAmount(lpBox, bankBoxIn, bankBoxOut, freeMintIn, HEIGHT)
    }

    validRateFreeMint(oracleBox: ErgoBox, lpBox: ErgoBox) {
        const oracleRateWithoutFee = BigInt(oracleBox.register_value(4).to_js())
        // check
        const lpReservesX = this.lpReservesX(lpBox)
        const lpReservesY = this.lpReservesY(lpBox)
        const lpRate = lpReservesX / lpReservesY
        return 98n * lpRate < oracleRateWithoutFee * 100n && oracleRateWithoutFee * 100n < 102n * lpRate
    }

    validDelta(oracleBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const ergsAdded = BigInt(bankBoxOut.value().as_i64().to_str()) - BigInt(bankBoxIn.value().as_i64().to_str())
        const oracleRateWithFee = this.oracleRateWithFee(oracleBox)
        return ergsAdded >= dexyMinted * oracleRateWithFee && ergsAdded > 0
    }

    oracleRateWithFee(oracleBox: ErgoBox) {
        const oracleRateWithoutFee = BigInt(oracleBox.register_value(4).to_js())
        return oracleRateWithoutFee * (this.feeNum + this.feeDenom)
    }

    dexyMinted(bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        return BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(bankBoxOut.tokens().get(1).amount().as_i64().to_str())
    }

    lpReservesX(lpBox: ErgoBox) {
        return BigInt(lpBox.value().as_i64().to_str())
    }

    lpReservesY(lpBox: ErgoBox) {
        return BigInt(lpBox.tokens().get(2).amount().as_i64().to_str())
    }

    validAmount(lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, freeMintIn: ErgoBox, HEIGHT: number) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const availableToMint = this.availableToMint(freeMintIn, lpBox, HEIGHT)
        return dexyMinted <= availableToMint
    }

    isCounterReset(freeMintIn: ErgoBox, HEIGHT: number) {
        return BigInt(HEIGHT) > BigInt(freeMintIn.register_value(4).to_js())
    }

    availableToMint(freeMintIn: ErgoBox, lpBox: ErgoBox, HEIGHT: number) {
        const lpReservesY = this.lpReservesY(lpBox)
        const maxAllowedIfReset = lpReservesY / 100n
        const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT)
        return isCounterReset ? maxAllowedIfReset : BigInt(freeMintIn.register_value(5).to_js())
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
