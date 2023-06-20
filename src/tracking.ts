import { RustModule } from "@ergolabs/ergo-sdk";
import {
    Address,
    ErgoBox,
    ErgoBoxes,
    ErgoBoxCandidate
} from "ergo-lib-wasm-browser";
import { DexyUnsignedTX } from "./models/types";

// TODO: should be test
class Tracking {
    private readonly threshold = 3
    private readonly maxInt = 2147483647


    createTrackingTransaction(tx_fee: number, lpIn: ErgoBox, oracleBox: ErgoBox, trackingBox: ErgoBox, userBoxes: ErgoBoxes, user_address: Address, HEIGHT: number): DexyUnsignedTX {
        const inputs = RustModule.SigmaRust.ErgoBoxes.empty()
        inputs.add(trackingBox)
        let userFund = 0n
        for (let i = 0; i < userBoxes.len(); i++) {
            inputs.add(userBoxes.get(i));
            userFund += BigInt(userBoxes.get(i).value().as_i64().to_str())
        }
        const target_tokens = new RustModule.SigmaRust.Tokens()
        const outputs = RustModule.SigmaRust.ErgoBoxCandidates.empty();
        const trackingBoxOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
            trackingBox.value(),
            RustModule.SigmaRust.Contract.new(trackingBox.ergo_tree()),
            HEIGHT
        )
        trackingBoxOut.add_token(trackingBox.tokens().get(0).id(), trackingBox.tokens().get(0).amount())
        target_tokens.add(new RustModule.SigmaRust.Token(trackingBox.tokens().get(0).id(), trackingBox.tokens().get(0).amount()))
        trackingBoxOut.set_register_value(4, trackingBox.register_value(4))
        trackingBoxOut.set_register_value(5, trackingBox.register_value(5))
        trackingBoxOut.set_register_value(6, trackingBox.register_value(6))
        if (trackingBox.register_value(7).to_js() === this.maxInt) {
            trackingBoxOut.set_register_value(7, RustModule.SigmaRust.Constant.from_js(HEIGHT))
        } else {
            trackingBoxOut.set_register_value(7, RustModule.SigmaRust.Constant.from_js(this.maxInt))
        }
        const trackingBoxOutBuild = trackingBoxOut.build()
        outputs.add(trackingBoxOutBuild)
        if (!this.correctAction(trackingBox, trackingBoxOutBuild, lpIn, oracleBox, HEIGHT))
            throw new Error("Invalid action")
        else if (this.numOut(trackingBoxOutBuild) !== this.numIn(trackingBox))
            throw new Error("Invalid numOut")
        else if (this.denomOut(trackingBoxOutBuild) !== this.denomIn(trackingBox))
            throw new Error("Invalid denomOut")
        else if (this.isBelowOut(trackingBoxOutBuild) !== this.isBelowIn(trackingBox))
            throw new Error("Invalid isBelowOut")

        const target_output_selector = new RustModule.SigmaRust.SimpleBoxSelector()
        const target_outputs = target_output_selector.select(
            inputs,
            RustModule.SigmaRust.BoxValue.from_i64(
                RustModule.SigmaRust.I64.from_str((
                    BigInt(tx_fee) +
                    BigInt(outputs.get(0).value().as_i64().as_num())
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
        data_inputs.add(new RustModule.SigmaRust.DataInput(oracleBox.box_id()));
        data_inputs.add(new RustModule.SigmaRust.DataInput(lpIn.box_id()));
        tx_builder.set_data_inputs(data_inputs);

        const data_inputs_ergoBoxes = RustModule.SigmaRust.ErgoBoxes.empty()
        data_inputs_ergoBoxes.add(oracleBox)
        data_inputs_ergoBoxes.add(lpIn)


        return {
            tx: tx_builder.build(),
            dataInputs: data_inputs_ergoBoxes,
            inputs: inputs
        }
    }

    numOut(trackingOut: ErgoBoxCandidate) {
        return trackingOut.register_value(4).to_js()
    }

    numIn(trackingIn: ErgoBox) {
        return trackingIn.register_value(4).to_js()
    }

    denomOut(trackingOut: ErgoBoxCandidate) {
        return trackingOut.register_value(5).to_js()
    }

    denomIn(trackingIn: ErgoBox) {
        return trackingIn.register_value(5).to_js()
    }

    isBelowOut(trackingOut: ErgoBoxCandidate) {
        return trackingOut.register_value(6).to_js()
    }

    isBelowIn(trackingIn: ErgoBox) {
        return trackingIn.register_value(6).to_js()
    }

    reservesX(lpBox: ErgoBox) {
        return BigInt(lpBox.value().as_i64().to_str())
    }

    reservesY(lpBox: ErgoBox) {
        return BigInt(lpBox.tokens().get(2).amount().as_i64().to_str())
    }

    lpRateXY(lpBox: ErgoBox) {
        return this.reservesX(lpBox) / this.reservesY(lpBox)
    }

    oracleRateXY(oracleBox: ErgoBox) {
        return BigInt(oracleBox.register_value(4).to_i64().to_str()) / 1000000n
    }

    correctAction(trackingIn: ErgoBox, trackingOut: ErgoBoxCandidate, lpBox: ErgoBox, oracleBox: ErgoBox, HEIGHT: number) {
        const x = this.lpRateXY(lpBox) * this.denomIn(trackingIn)
        const y = this.numIn(trackingIn) * this.oracleRateXY(oracleBox)
        const notTriggeredEarlier = trackingIn.register_value(7).to_js() === this.maxInt
        const triggeredNow = trackingOut.register_value(7).to_js() >= HEIGHT - this.threshold && trackingOut.register_value(7).to_js() <= HEIGHT

        const notResetEarlier = trackingIn.register_value(7).to_js() < this.maxInt
        const resetNow = trackingOut.register_value(7).to_js() === this.maxInt

        const trigger = ((this.isBelowIn(trackingIn) && x < y) || (!this.isBelowIn(trackingIn) && x > y)) && notTriggeredEarlier && triggeredNow
        const reset = ((this.isBelowIn(trackingIn) && x >= y) || (!this.isBelowIn(trackingIn) && x <= y)) && notResetEarlier && resetNow
        return trigger || reset
    }
}

export { Tracking }
