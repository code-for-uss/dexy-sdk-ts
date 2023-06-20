import { RustModule } from "@ergolabs/ergo-sdk";
import {
    ErgoBox,
    ErgoBoxes,
    Address,
    ErgoBoxCandidate
} from "ergo-lib-wasm-browser";
import { DexyUnsignedTX } from "../models/types";
import { Dexy } from "./dexy";

class ArbitrageMint extends Dexy {
    private readonly T_arb = 30n
    private readonly T_buffer = 5n

    constructor(oracleBox: ErgoBox, lpBox: ErgoBox) {
        super(oracleBox, lpBox);
    }

    createArbitrageMintTransaction(tx_fee: number, mintValue: number, arbitrageMintIn: ErgoBox, buybackBoxIn: ErgoBox, bankBoxIn: ErgoBox, userBoxes: ErgoBoxes, user_address: Address, tracking101Box: ErgoBox, HEIGHT: number): DexyUnsignedTX {
        const availableToMint = this.availableToMint(arbitrageMintIn, HEIGHT)
        if (mintValue > availableToMint)
            throw new Error("Mint Value is more than available to mint")
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
            if (userFund < this.ergNeeded(mintValue))
                throw new Error("Not enough ERG in user boxes")
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
            const arbitrageMintOutBuild = arbitrageMintOut.build()
            outputs.add(arbitrageMintOutBuild)

            const bankBoxOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
                RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.value().as_i64().to_str()) + this.ergNeededBankBox(mintValue)).toString())),
                RustModule.SigmaRust.Contract.new(bankBoxIn.ergo_tree()),
                HEIGHT
            )
            bankBoxOut.add_token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount())
            bankBoxOut.add_token(bankBoxIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(mintValue)).toString())))
            target_tokens.add(new RustModule.SigmaRust.Token(bankBoxIn.tokens().get(0).id(), bankBoxIn.tokens().get(0).amount()))
            target_tokens.add(new RustModule.SigmaRust.Token(bankBoxIn.tokens().get(1).id(), RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(bankBoxIn.tokens().get(1).amount().as_i64().to_str()) - BigInt(mintValue)).toString()))))
            const bankBoxOutBuild = bankBoxOut.build()
            outputs.add(bankBoxOutBuild)

            const buybackBoxOut = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
                RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str((BigInt(buybackBoxIn.value().as_i64().to_str()) + this.ergNeededBuyBackBox(mintValue)).toString())),
                RustModule.SigmaRust.Contract.new(buybackBoxIn.ergo_tree()),
                HEIGHT
            )
            buybackBoxOut.add_token(buybackBoxIn.tokens().get(0).id(), buybackBoxIn.tokens().get(0).amount())
            target_tokens.add(new RustModule.SigmaRust.Token(buybackBoxIn.tokens().get(0).id(), buybackBoxIn.tokens().get(0).amount()))
            const buybackBoxOutBuild = buybackBoxOut.build()
            outputs.add(buybackBoxOutBuild)

            if (!this.validSuccessor(arbitrageMintIn, arbitrageMintOutBuild, bankBoxIn, bankBoxOutBuild, HEIGHT))
                throw new Error("Invalid successor")
            else if (!this.validDelta(bankBoxIn, bankBoxOutBuild, buybackBoxIn, buybackBoxOutBuild))
                throw new Error("Invalid delta")
            else if (!this.validAmount(bankBoxIn, bankBoxOutBuild, arbitrageMintIn, HEIGHT))
                throw new Error("Invalid amount")
            else if (!this.validDelay(tracking101Box, HEIGHT))
                throw new Error("Invalid delay")
            else if (!this.validThreshold())
                throw new Error("Invalid threshold")

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
            data_inputs.add(new RustModule.SigmaRust.DataInput(this.oracleBox.box_id()));
            data_inputs.add(new RustModule.SigmaRust.DataInput(this.lpBox.box_id()));
            data_inputs.add(new RustModule.SigmaRust.DataInput(tracking101Box.box_id()));
            tx_builder.set_data_inputs(data_inputs);

            const data_inputs_ergoBoxes = RustModule.SigmaRust.ErgoBoxes.empty()
            data_inputs_ergoBoxes.add(this.oracleBox)
            data_inputs_ergoBoxes.add(this.lpBox)
            data_inputs_ergoBoxes.add(tracking101Box)

            const contextExtension = new RustModule.SigmaRust.ContextExtension()
            contextExtension.set_pair(0, RustModule.SigmaRust.Constant.from_js(1))
            tx_builder.set_context_extension(buybackBoxIn.box_id(), contextExtension)

            const transaction = tx_builder.build()

            return {
                tx: transaction,
                dataInputs: data_inputs_ergoBoxes,
                inputs: inputs
            }
        }
    }

    // // TODO: transaction as input
    transactionValidator(arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBoxCandidate, bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBoxCandidate, tracking101Box: ErgoBox, HEIGHT: number) {
        return this.validSuccessor(arbitrageMintIn, arbitrageMintOut, bankBoxIn, bankBoxOut, HEIGHT) && this.validDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut) && this.validAmount(bankBoxIn, bankBoxOut, arbitrageMintIn, HEIGHT) && this.validDelay(tracking101Box, HEIGHT) && this.validThreshold()
    }

    validDelay(tracking101Box: ErgoBox, HEIGHT: number) {
        return BigInt(tracking101Box.register_value(7).to_js()) < BigInt(HEIGHT) - this.T_arb
    }


    validBuybackDelta(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBoxCandidate) {
        return this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) >= this.dexyMinted(bankBoxIn, bankBoxOut) * this.buybackRate() && this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) > 0
    }

    validDelta(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBoxCandidate) {
        return this.validBankDelta(bankBoxIn, bankBoxOut) && this.validBuybackDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut)
    }

    validAmount(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, arbitrageMintIn: ErgoBox, HEIGHT: number) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const availableToMint = this.availableToMint(arbitrageMintIn, HEIGHT)
        return dexyMinted <= availableToMint
    }

    isCounterReset(arbitrageMintIn: ErgoBox, HEIGHT: number) {
        return BigInt(HEIGHT) > BigInt(arbitrageMintIn.register_value(4).to_js())
    }

    maxAllowedIfReset() {
        return (this.lpReservesX() - this.oracleRateWithFee() * this.lpReservesY()) / this.oracleRateWithFee()
    }

    availableToMint(arbitrageMintIn: ErgoBox, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(arbitrageMintIn, HEIGHT)
        return isCounterReset ? this.maxAllowedIfReset() : BigInt(arbitrageMintIn.register_value(5).to_js())
    }


    validSuccessorR4(arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBoxCandidate, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(arbitrageMintIn, HEIGHT)
        if (!isCounterReset) {
            return arbitrageMintOut.register_value(4).encode_to_base16() === arbitrageMintIn.register_value(4).encode_to_base16()
        } else {
            return BigInt(arbitrageMintOut.register_value(4).to_js()) >= BigInt(HEIGHT) + this.T_arb && BigInt(arbitrageMintOut.register_value(4).to_js()) <= BigInt(HEIGHT) + this.T_arb + this.T_buffer
        }
    }

    validSuccessorR5(arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBoxCandidate, bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, HEIGHT: number) {
        return BigInt(arbitrageMintOut.register_value(5).to_js()) === this.availableToMint(arbitrageMintIn, HEIGHT) - this.dexyMinted(bankBoxIn, bankBoxOut)
    }

    validSuccessor(arbitrageMintIn: ErgoBox, arbitrageMintOut: ErgoBoxCandidate, bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, HEIGHT: number) {
        return arbitrageMintOut.ergo_tree().to_base16_bytes() === arbitrageMintIn.ergo_tree().to_base16_bytes() && BigInt(arbitrageMintOut.value().as_i64().to_str()) >= BigInt(arbitrageMintIn.value().as_i64().to_str()) && this.validSuccessorR4(arbitrageMintIn, arbitrageMintOut, HEIGHT) && this.validSuccessorR5(arbitrageMintIn, arbitrageMintOut, bankBoxIn, bankBoxOut, HEIGHT)
    }
}

export { ArbitrageMint }
