import { RustModule } from "@ergolabs/ergo-sdk";
import type {
    Address,
    ErgoBox,
    ErgoBoxes,
    ErgoBoxCandidate
} from "ergo-lib-wasm-browser";
import { Dexy } from "./dexy";
import { DexyUnsignedTX } from "../models/types";

class FreeMint extends Dexy {
    private readonly T_free = 360n
    private readonly T_buffer = 5n

    constructor(oracleBox: ErgoBox, lpBox: ErgoBox) {
        super(oracleBox, lpBox);
    }

    createFreeMintTransaction(tx_fee: number, mintValue: number, freeMintIn: ErgoBox, buybackBoxIn: ErgoBox, bankBoxIn: ErgoBox, userBoxes: ErgoBoxes, user_address: Address, HEIGHT: number): DexyUnsignedTX {
        const availableToMint = this.availableToMint(freeMintIn, HEIGHT)
        if (mintValue > availableToMint)
            throw new Error("Mint Value is more than available to mint")
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
            if (userFund < this.ergNeeded(mintValue))
                new Error("Not enough ERG in user boxes")
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
            const freeMintOutBuild = freeMintOut.build()
            outputs.add(freeMintOutBuild)
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
            if (!this.validSuccessor(freeMintIn, freeMintOutBuild, bankBoxIn, bankBoxOutBuild, HEIGHT))
                throw new Error("Invalid successor")
            else if (!this.validDelta(bankBoxIn, bankBoxOutBuild, buybackBoxIn, buybackBoxOutBuild))
                throw new Error("Invalid delta")
            else if (!this.validRateFreeMint())
                throw new Error("Invalid free mint rate")
            else if (!this.validAmount(bankBoxIn, bankBoxOutBuild, freeMintIn, HEIGHT))
                throw new Error("Invalid amount")
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
            tx_builder.set_data_inputs(data_inputs);

            const data_inputs_ergoBoxes = RustModule.SigmaRust.ErgoBoxes.empty()
            data_inputs_ergoBoxes.add(this.oracleBox)
            data_inputs_ergoBoxes.add(this.lpBox)

            const contextExtension = new RustModule.SigmaRust.ContextExtension()
            contextExtension.set_pair(0, RustModule.SigmaRust.Constant.from_js(1))
            tx_builder.set_context_extension(buybackBoxIn.box_id(), contextExtension)
            const transaction = tx_builder.build();

            return {
                tx: transaction,
                dataInputs: data_inputs_ergoBoxes,
                inputs: inputs
            }
        }
    }

    // TODO: transaction as input
    transactionValidator(freeMintIn: ErgoBox, freeMintOut: ErgoBox, bankBoxIn: ErgoBox, bankBoxOut: ErgoBox, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBox, HEIGHT: number) {
        return this.validSuccessor(freeMintIn, freeMintOut, bankBoxIn, bankBoxOut, HEIGHT) && this.validDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut) && this.validRateFreeMint() && this.validAmount(bankBoxIn, bankBoxOut, freeMintIn, HEIGHT)
    }

    validBuybackDelta(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBoxCandidate) {
        return this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) >= this.dexyMinted(bankBoxIn, bankBoxOut) * this.buybackRate() && this.buybackErgsAdded(buybackBoxIn, buybackBoxOut) > 0
    }

    validDelta(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, buybackBoxIn: ErgoBox, buybackBoxOut: ErgoBoxCandidate) {
        return this.validBankDelta(bankBoxIn, bankBoxOut) && this.validBuybackDelta(bankBoxIn, bankBoxOut, buybackBoxIn, buybackBoxOut)
    }

    validAmount(bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, freeMintIn: ErgoBox, HEIGHT: number) {
        const dexyMinted = this.dexyMinted(bankBoxIn, bankBoxOut)
        const availableToMint = this.availableToMint(freeMintIn, HEIGHT)
        return dexyMinted <= availableToMint
    }

    isCounterReset(freeMintIn: ErgoBox, HEIGHT: number) {
        return BigInt(HEIGHT) > BigInt(freeMintIn.register_value(4).to_js())
    }

    maxAllowedIfReset() {
        return this.lpReservesY() / 100n
    }

    availableToMint(freeMintIn: ErgoBox, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT)
        return isCounterReset ? this.maxAllowedIfReset() : BigInt(freeMintIn.register_value(5).to_js())
    }

    validSuccessorR4(freeMintIn: ErgoBox, freeMintOut: ErgoBoxCandidate, HEIGHT: number) {
        const isCounterReset = this.isCounterReset(freeMintIn, HEIGHT)
        if (!isCounterReset) {
            return freeMintOut.register_value(4).to_js() === freeMintIn.register_value(4).to_js()
        } else {
            return BigInt(freeMintOut.register_value(4).to_js()) >= BigInt(HEIGHT) + this.T_free && BigInt(freeMintOut.register_value(4).to_js()) <= BigInt(HEIGHT) + this.T_free + this.T_buffer
        }
    }

    validSuccessorR5(freeMintIn: ErgoBox, freeMintOut: ErgoBoxCandidate, bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, HEIGHT: number) {
        return BigInt(freeMintOut.register_value(5).to_js()) === this.availableToMint(freeMintIn, HEIGHT) - this.dexyMinted(bankBoxIn, bankBoxOut)
    }

    validSuccessor(freeMintIn: ErgoBox, freeMintOut: ErgoBoxCandidate, bankBoxIn: ErgoBox, bankBoxOut: ErgoBoxCandidate, HEIGHT: number) {
        return freeMintOut.ergo_tree().to_base16_bytes() === freeMintIn.ergo_tree().to_base16_bytes() && BigInt(freeMintOut.value().as_i64().to_str()) >= BigInt(freeMintIn.value().as_i64().to_str()) && this.validSuccessorR4(freeMintIn, freeMintOut, HEIGHT) && this.validSuccessorR5(freeMintIn, freeMintOut, bankBoxIn, bankBoxOut, HEIGHT)
    }
}

export { FreeMint }
