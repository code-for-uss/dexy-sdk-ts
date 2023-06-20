import { RustModule } from "@ergolabs/ergo-sdk";
import {
    Address,
    ErgoBox,
    ErgoBoxes,
    ErgoBoxCandidate
} from "ergo-lib-wasm-browser";
import { DexyUnsignedTX } from "./models/types";

// TODO: Tested on chain but need to add unit test for this scenario
class Intervention {
    private readonly T_int = 20
    private readonly thresholdPercent = 98n


    createInterventionTransaction(tx_fee: number, lpIn: ErgoBox, bankBoxIn: ErgoBox, interventionIn: ErgoBox, oracleBox: ErgoBox, tracking98Box: ErgoBox, userBoxes: ErgoBoxes, user_address: Address, HEIGHT: number): DexyUnsignedTX {
        const erg_change = BigInt(bankBoxIn.value().as_i64().to_str()) / 100n
        const dexy_change = erg_change * BigInt(lpIn.tokens().get(2).amount().as_i64().to_str()) / BigInt(lpIn.value().as_i64().to_str())
        const inputs = RustModule.SigmaRust.ErgoBoxes.empty()
        inputs.add(lpIn)
        inputs.add(bankBoxIn)
        inputs.add(interventionIn)
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
            RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(lpIn.value().as_i64().to_str()) + erg_change).toString())),
            RustModule.SigmaRust.Contract.new(lpIn.ergo_tree()),
            HEIGHT
        )
        for (let i = 0; i < 2; i++) {
            lpOut.add_token(lpIn.tokens().get(i).id(), lpIn.tokens().get(i).amount())
            target_tokens.add(new RustModule.SigmaRust.Token(lpIn.tokens().get(i).id(), lpIn.tokens().get(i).amount()))
        }
        lpOut.add_token(lpIn.tokens().get(2).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(lpIn.tokens().get(2).amount().as_i64().to_str()) - dexy_change).toString())))
        target_tokens.add(new RustModule.SigmaRust.Token(lpIn.tokens().get(2).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(lpIn.tokens().get(2).amount().as_i64().to_str()) - dexy_change).toString()))))
        const lpOutBuild = lpOut.build()
        outputs.add(lpOutBuild)
        const bankBoxOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
            RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.value().as_i64().to_str()) - erg_change).toString())),
            RustModule.SigmaRust.Contract.new(bankBoxIn.ergo_tree()),
            HEIGHT
        )
        bankBoxOut.add_token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount())
        bankBoxOut.add_token(bankBoxIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) + dexy_change).toString())))
        target_tokens.add(new RustModule.SigmaRust.Token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount()))
        target_tokens.add(new RustModule.SigmaRust.Token(bankBoxIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) + dexy_change).toString()))))
        const bankBoxOutBuild = bankBoxOut.build()
        outputs.add(bankBoxOutBuild)
        const interventionOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
            interventionIn.value(),
            RustModule.SigmaRust.Contract.new(interventionIn.ergo_tree()),
            HEIGHT
        )
        interventionOut.add_token(interventionIn.tokens().get(0).id(), interventionIn.tokens().get(0).amount())
        target_tokens.add(new RustModule.SigmaRust.Token(interventionIn.tokens().get(0).id(), interventionIn.tokens().get(0).amount()))
        const interventionOutBuild = interventionOut.build()
        outputs.add(interventionOutBuild)

        if (!this.validThreshold(lpIn, lpOutBuild, oracleBox))
            throw new Error("Threshold is not valid")
        else if (!this.validTracking(tracking98Box, HEIGHT))
            throw new Error("Tracking is not valid")
        else if (!this.validMaxSpending(lpIn, lpOutBuild, bankBoxIn, bankBoxOutBuild, oracleBox))
            throw new Error("Max spending is not valid")
        else if (!this.validDeltas(lpIn, lpOutBuild, bankBoxIn, bankBoxOutBuild))
            throw new Error("Deltas is not valid")

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
            RustModule.SigmaRust.Address.recreate_from_ergo_tree(user_address.to_ergo_tree())
        )
        const data_inputs = new RustModule.SigmaRust.DataInputs();
        data_inputs.add(new RustModule.SigmaRust.DataInput(oracleBox.box_id()));
        data_inputs.add(new RustModule.SigmaRust.DataInput(tracking98Box.box_id()));
        tx_builder.set_data_inputs(data_inputs);

        const data_inputs_ergoBoxes = RustModule.SigmaRust.ErgoBoxes.empty()
        data_inputs_ergoBoxes.add(oracleBox)
        data_inputs_ergoBoxes.add(tracking98Box)

        return {
            tx: tx_builder.build(),
            dataInputs: data_inputs_ergoBoxes,
            inputs: inputs
        }
    }

    deltaLpX(lpBoxIn: ErgoBox, lpBoxOut: ErgoBoxCandidate) {
        return this.lpReservesXOut(lpBoxOut) - this.lpReservesXIn(lpBoxIn)
    }

    deltaLpY(lpBoxIn: ErgoBox, lpBoxOut: ErgoBoxCandidate) {
        return this.lpReservesYIn(lpBoxIn) - this.lpReservesYOut(lpBoxOut)
    }

    deltaBankErgs(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate) {
        return BigInt(bankBoxIn.value().as_i64().to_str()) - BigInt(bankBoxOut.value().as_i64().to_str())
    }

    deltaBankTokens(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate) {
        return BigInt(bankBoxOut.tokens().get(1).amount().as_i64().to_str()) - BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str())
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

    oracleRateXy(oracleBox: ErgoBox) {
        return BigInt(oracleBox.register_value(4).to_i64().to_str()) / 1000000n
    }

    validThreshold(lpBoxIn: ErgoBox, lpBoxOut: ErgoBoxCandidate, oracleBox: ErgoBox) {
        return this.lpReservesXIn(lpBoxIn) * 100n < this.oracleRateXy(oracleBox) * this.thresholdPercent * this.lpReservesYIn(lpBoxIn)
    }

    validTracking(trackingBox: ErgoBox, HEIGHT: number) {
        return trackingBox.register_value(7).to_js() < HEIGHT - this.T_int
    }

    validMaxSpending(lpBoxIn: ErgoBox, lpBoxOut: ErgoBoxCandidate, bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, oracleBox: ErgoBox) {
        return this.lpReservesXOut(lpBoxOut) * 1000n <= this.oracleRateXy(oracleBox) * this.lpReservesYOut(lpBoxOut) * 995n && this.deltaBankErgs(bankBoxIn, bankBoxOut) <= BigInt(bankBoxIn.value().as_i64().to_str())
    }

    validDeltas(lpBoxIn: ErgoBox, lpBoxOut: ErgoBoxCandidate, bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate) {
        return this.deltaBankErgs(bankBoxIn, bankBoxOut) <= this.deltaLpX(lpBoxIn, lpBoxOut) && this.deltaBankTokens(bankBoxIn, bankBoxOut) >= this.deltaLpY(lpBoxIn, lpBoxOut) && this.deltaLpX(lpBoxIn, lpBoxOut) > 0n
    }
}

export { Intervention }
