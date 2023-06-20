import { RustModule } from "@ergolabs/ergo-sdk";
import {
    Address,
    ErgoBox,
    ErgoBoxes,
    ErgoBoxCandidate
} from "ergo-lib-wasm-browser";
import { DexyUnsignedTX } from "./models/types";

// TODO: Tested on chain but need to add unit test for this scenario
class Extract {
    private readonly minBankNanoErgs = 10000000000n

    createExtractTransaction(tx_fee: number, lpIn: ErgoBox, extractIn: ErgoBox, oracleBox: ErgoBox, tracking95Box: ErgoBox, tracking101Box: ErgoBox, bankBox: ErgoBox, userBoxes: ErgoBoxes, user_address: Address, HEIGHT: number): DexyUnsignedTX {
        const inputs = RustModule.SigmaRust.ErgoBoxes.empty()
        let RELEASE = false
        if (!this.validBankBox(bankBox)) {
            RELEASE = true
        }
        inputs.add(lpIn)
        inputs.add(extractIn)
        let userFund = 0n
        for (let i = 0; i < userBoxes.len(); i++) {
            inputs.add(userBoxes.get(i));
            userFund += BigInt(userBoxes.get(i).value().as_i64().to_str())
        }
        if (userFund < tx_fee)
            throw new Error("user fund is not enough")
        const target_tokens = new RustModule.SigmaRust.Tokens()
        const outputs = RustModule.SigmaRust.ErgoBoxCandidates.empty();
        const lpOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
            RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(lpIn.value().as_i64().to_str())).toString())),
            RustModule.SigmaRust.Contract.new(lpIn.ergo_tree()),
            HEIGHT
        )
        for (let i = 0; i < 2; i++) {
            lpOut.add_token(lpIn.tokens().get(i).id(), lpIn.tokens().get(i).amount())
            target_tokens.add(new RustModule.SigmaRust.Token(lpIn.tokens().get(i).id(), lpIn.tokens().get(i).amount()))
        }
        const oracleRateXY = BigInt(oracleBox.register_value(4).to_i64().to_str()) / 1000000n
        const lpReservesXOut = BigInt(lpIn.value().as_i64().to_str())
        let deltaDexy = BigInt(lpIn.tokens().get(2).amount().as_i64().to_str())
        if (RELEASE) {
            deltaDexy -= (lpReservesXOut * 100n) / (oracleRateXY * 101n)
            lpOut.add_token(lpIn.tokens().get(2).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str(((lpReservesXOut * 100n) / (oracleRateXY * 101n)).toString())))
            target_tokens.add(new RustModule.SigmaRust.Token(lpIn.tokens().get(2).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str(((lpReservesXOut * 100n) / (oracleRateXY * 101n)).toString()))))
        } else {
            deltaDexy -= (lpReservesXOut * 100n) / (oracleRateXY * 97n)
            lpOut.add_token(lpIn.tokens().get(2).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str(((lpReservesXOut * 100n) / (oracleRateXY * 97n)).toString())))
            target_tokens.add(new RustModule.SigmaRust.Token(lpIn.tokens().get(2).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str(((lpReservesXOut * 100n) / (oracleRateXY * 97n)).toString()))))
        }
        const lpOutBuild = lpOut.build()
        outputs.add(lpOutBuild)
        const extractOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
            RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(extractIn.value().as_i64().to_str())).toString())),
            RustModule.SigmaRust.Contract.new(extractIn.ergo_tree()),
            HEIGHT
        )
        extractOut.add_token(extractIn.tokens().get(0).id(), extractIn.tokens().get(0).amount())
        extractOut.add_token(extractIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(extractIn.tokens().get(1).amount().as_i64().to_str()) + deltaDexy).toString())))
        target_tokens.add(new RustModule.SigmaRust.Token(extractIn.tokens().get(0).id(), extractIn.tokens().get(0).amount()))
        target_tokens.add(new RustModule.SigmaRust.Token(extractIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(extractIn.tokens().get(1).amount().as_i64().to_str()) + deltaDexy).toString()))))
        const extractOutBuild = extractOut.build()
        outputs.add(extractOutBuild)

        if (!this.validBankBox(bankBox))
            throw new Error("Bank box is not valid")
        else if (!this.validExtract(lpIn, lpOutBuild, oracleBox, bankBox, extractIn, extractOutBuild) && !this.validRelease(lpIn, lpOutBuild, oracleBox, bankBox))
            throw new Error("Extract and Release is not valid")
        else if (!this.validLpBox(lpIn, lpOutBuild, extractIn, extractOutBuild))
            throw new Error("Lp box is not valid")

        const target_output_selector = new RustModule.SigmaRust.SimpleBoxSelector()
        const target_outputs = target_output_selector.select(
            inputs,
            RustModule.SigmaRust.BoxValue.from_i64(
                RustModule.SigmaRust.I64.from_str((
                    BigInt(tx_fee) +
                    BigInt(outputs.get(0).value().as_i64().as_num()) +
                    BigInt(outputs.get(1).value().as_i64().as_num())
                ).toString())),
            target_tokens)
        const tx_builder = RustModule.SigmaRust.TxBuilder.new(
            new RustModule.SigmaRust.BoxSelection(inputs, target_outputs.change()),
            outputs,
            HEIGHT,
            RustModule.SigmaRust.BoxValue.from_i64(
                RustModule.SigmaRust.I64.from_str(tx_fee.toString())
            ),
            RustModule.SigmaRust.Address.recreate_from_ergo_tree(user_address.to_ergo_tree())
        )
        const data_inputs = new RustModule.SigmaRust.DataInputs();
        const data_inputs_ergoBoxes = RustModule.SigmaRust.ErgoBoxes.empty()
        data_inputs.add(new RustModule.SigmaRust.DataInput(oracleBox.box_id()));
        data_inputs_ergoBoxes.add(oracleBox)
        if (RELEASE) {
            data_inputs.add(new RustModule.SigmaRust.DataInput(tracking101Box.box_id()));
            data_inputs_ergoBoxes.add(tracking101Box)
        } else {
            data_inputs.add(new RustModule.SigmaRust.DataInput(tracking95Box.box_id()));
            data_inputs.add(new RustModule.SigmaRust.DataInput(bankBox.box_id()));
            data_inputs_ergoBoxes.add(tracking95Box)
            data_inputs_ergoBoxes.add(bankBox)
        }

        tx_builder.set_data_inputs(data_inputs);


        return {
            tx: tx_builder.build(),
            dataInputs: data_inputs_ergoBoxes,
            inputs: inputs
        }
    }


    deltaDexy(extractIn: ErgoBox, extractOut: ErgoBoxCandidate) {
        return BigInt(extractOut.tokens().get(1).amount().as_i64().to_str()) - BigInt(extractIn.tokens().get(1).amount().as_i64().to_str())
    }

    lpReservesXOut(lpBoxOut: ErgoBoxCandidate) {
        return BigInt(lpBoxOut.value().as_i64().to_str())
    }

    lpReservesXIn(lpBoxIn: ErgoBox) {
        return BigInt(lpBoxIn.value().as_i64().to_str())
    }

    lpReservesYIn(lpBoxIn: ErgoBox) {
        return BigInt(lpBoxIn.tokens().get(2).amount().as_i64().to_str())
    }

    lpReservesYOut(lpBoxOut: ErgoBoxCandidate) {
        return BigInt(lpBoxOut.tokens().get(2).amount().as_i64().to_str())
    }

    lpRateXYOut(lpBoxOut: ErgoBoxCandidate) {
        return this.lpReservesXOut(lpBoxOut) / this.lpReservesYOut(lpBoxOut)
    }

    oracleRateXy(oracleBox: ErgoBox) {
        return BigInt(oracleBox.register_value(4).to_i64().to_str()) / 1000000n
    }

    validExtractAmount(oracleBox: ErgoBox, lpBoxOut: ErgoBoxCandidate) {
        return this.oracleRateXy(oracleBox) * 97n < this.lpRateXYOut(lpBoxOut) * 100n && this.oracleRateXy(oracleBox) * 98n > this.lpRateXYOut(lpBoxOut) * 100n
    }

    validReleaseAmount(oracleBox: ErgoBox, lpBoxOut: ErgoBoxCandidate) {
        return this.oracleRateXy(oracleBox) * 101n > this.lpRateXYOut(lpBoxOut) * 100n
    }

    validExtract(lpBoxIn: ErgoBox, lpBoxOut: ErgoBoxCandidate, oracleBox: ErgoBox, bankBox: ErgoBox, extractIn: ErgoBox, extractOut: ErgoBoxCandidate) {
        return this.deltaDexy(extractIn, extractOut) > 0n && this.validExtractAmount(oracleBox, lpBoxOut) && this.validBankBox(bankBox)
    }

    validRelease(lpBoxIn: ErgoBox, lpBoxOut: ErgoBoxCandidate, oracleBox: ErgoBox, bankBox: ErgoBox) {
        return this.deltaDexy(lpBoxIn, lpBoxOut) < 0n && this.validReleaseAmount(oracleBox, lpBoxOut)
    }

    validBankBox(bankBox: ErgoBox) {
        return BigInt(bankBox.value().as_i64().to_str()) <= this.minBankNanoErgs
    }

    validLpBox(lpBox: ErgoBox, lpBoxOut: ErgoBoxCandidate, extractIn: ErgoBox, extractOut: ErgoBoxCandidate) {
        return this.lpReservesYOut(lpBoxOut) === this.lpReservesYIn(lpBox) - this.deltaDexy(extractIn, extractOut) && this.lpReservesXOut(lpBoxOut) === this.lpReservesXIn(lpBox)
    }
}

export { Extract }
