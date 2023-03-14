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

class ArbitrageMint {
    private readonly networkPrefix: NetworkPrefix
    private readonly T_arb = 30n
    private readonly T_buffer = 5n
    private readonly feeNum = 5n
    private readonly feeDenom = 1000n
    private readonly thresholdPercent = 101n

    constructor(networkPrefix: NetworkPrefix = NetworkPrefix.Mainnet) {
        this.networkPrefix = networkPrefix
    }

    createArbitrageMintTransaction(tx_fee: number, mintValue: number, arbitrageMintIn: ErgoBox, bankBoxIn: ErgoBox, userBoxes: ErgoBoxes, lpBox: ErgoBox, user_address: Address, oracleBox: ErgoBox, tracking101Box:ErgoBox, HEIGHT: number) {
        const availableToMint = this.availableToMint(arbitrageMintIn, lpBox, oracleBox, HEIGHT)
        if (mintValue > availableToMint)
            return undefined
        else {
            const inputs = ErgoBoxes.empty()
            inputs.add(arbitrageMintIn)
            inputs.add(bankBoxIn)
            let userFund = 0n
            for (let i = 0; i < userBoxes.len(); i++) {
                inputs.add(userBoxes.get(i));
                userFund += BigInt(userBoxes.get(i).value().as_i64().to_str())
            }
            if (userFund < this.ergNeeded(mintValue, oracleBox))
                return undefined
            const target_tokens = new Tokens()
            const outputs = ErgoBoxCandidates.empty();
            const arbitrageMintOut = new ErgoBoxCandidateBuilder(
                arbitrageMintIn.value(),
                Contract.new(arbitrageMintIn.ergo_tree()),
                HEIGHT
            )
            arbitrageMintOut.set_register_value(4, !this.isCounterReset(arbitrageMintIn, HEIGHT) ? arbitrageMintIn.register_value(4) : Constant.from_i64(I64.from_str((BigInt(HEIGHT) + this.T_arb).toString())))
            arbitrageMintOut.set_register_value(5, Constant.from_i64(I64.from_str((availableToMint - BigInt(mintValue)).toString())))
            for (let i = 0; i < arbitrageMintIn.tokens().len(); i++) {
                arbitrageMintOut.add_token(arbitrageMintIn.tokens().get(i).id(), arbitrageMintIn.tokens().get(i).amount())
                target_tokens.add(new Token(arbitrageMintIn.tokens().get(i).id(), arbitrageMintIn.tokens().get(i).amount()))
            }
            outputs.add(arbitrageMintOut.build())

            const bankBoxOut = new ErgoBoxCandidateBuilder(
                BoxValue.from_i64(I64.from_str((BigInt(bankBoxIn.value().as_i64().to_str()) + this.ergNeededWithFee(mintValue, oracleBox)).toString())),
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
            data_inputs.add(new DataInput(tracking101Box.box_id()));
            tx_builder.set_data_inputs(data_inputs);

            const data_inputs_ergoBoxes = ErgoBoxes.empty()
            data_inputs_ergoBoxes.add(oracleBox)
            data_inputs_ergoBoxes.add(lpBox)
            data_inputs_ergoBoxes.add(tracking101Box)

            return {
                tx:tx_builder.build(),
                dataInputs: data_inputs_ergoBoxes,
                inputs: inputs
            }
        }
    }

    private ergNeededWithFee(mintValue: number, oracleBox: ErgoBox): bigint {
        return BigInt(mintValue) * this.oracleRateWithFee(oracleBox)
    }

    private implementorFee(mintValue: number, oracleBox: ErgoBox): bigint {
        return this.ergNeededWithFee(mintValue, oracleBox) * IMPLEMENTOR.fee_per / BigInt(1e4)
    }

    ergNeeded(mintValue: number, oracleBox: ErgoBox): bigint {
        return BigInt(mintValue) * this.oracleRateWithFee(oracleBox) * (IMPLEMENTOR.fee_per + BigInt(1))  / BigInt(1e4)
    }

    // TODO: transaction as input
    transactionValidator(oracleBox: ErgoBox, arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBox, lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, tracking101Box: ErgoBox, HEIGHT: number) {
        return this.validSuccessor(arbitrageMintIn, arbitrageMintOut, lpBox, bankBoxIn, bankBoxOut, oracleBox, HEIGHT) && this.validDelta(oracleBox, bankBoxIn, bankBoxOut) && this.validAmount(lpBox, bankBoxIn, bankBoxOut, arbitrageMintIn, oracleBox, HEIGHT) && this.validDelay(tracking101Box, HEIGHT) && this.validThreshold(lpBox,oracleBox)
    }

    validDelay(tracking101Box: ErgoBox, HEIGHT: number){
        return BigInt(tracking101Box.register_value(7).to_i64().to_str()) < BigInt(HEIGHT) - this.T_arb
    }
    validThreshold(lpBox:ErgoBox, oracleBox: ErgoBox){
        const lpReservesY = this.lpReservesY(lpBox)
        const lpReservesX = this.lpReservesX(lpBox)
        return (lpReservesX / lpReservesY) * 100n > this.thresholdPercent * this.oracleRateWithFee(oracleBox)
    }

    validDelta(oracleBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const ergsAdded = BigInt(bankBoxOut.value().as_i64().to_str()) - BigInt(bankBoxIn.value().as_i64().to_str())
        const oracleRateWithFee = this.oracleRateWithFee(oracleBox)
        return ergsAdded >= dexyMinted * oracleRateWithFee && ergsAdded > 0
    }

    oracleRateWithFee(oracleBox: ErgoBox) {
        const oracleRateWithoutFee = BigInt(oracleBox.register_value(4).to_js())
        return oracleRateWithoutFee * (this.feeNum + this.feeDenom) / this.feeDenom
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

    validAmount(lpBox: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, arbitrageMintIn: ErgoBox, oracleBox: ErgoBox, HEIGHT: number) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const availableToMint = this.availableToMint(arbitrageMintIn, lpBox, oracleBox, HEIGHT)
        return dexyMinted <= availableToMint
    }

    isCounterReset(arbitrageMintIn: ErgoBox, HEIGHT: number) {
        return BigInt(HEIGHT) > BigInt(arbitrageMintIn.register_value(4).to_js())
    }

    availableToMint(arbitrageMintIn: ErgoBox, lpBox: ErgoBox, oracleBox: ErgoBox, HEIGHT: number) {
        const lpReservesY = this.lpReservesY(lpBox)
        const lpReservesX = this.lpReservesX(lpBox)
        const oracleRateWithFee = this.oracleRateWithFee(oracleBox)
        const maxAllowedIfReset = (lpReservesX - oracleRateWithFee * lpReservesY) / oracleRateWithFee
        const isCounterReset = this.isCounterReset(arbitrageMintIn, HEIGHT)
        return isCounterReset ? maxAllowedIfReset : BigInt(arbitrageMintIn.register_value(5).to_js())
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
