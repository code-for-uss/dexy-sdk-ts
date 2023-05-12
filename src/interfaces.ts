import { ErgoBoxes, UnsignedTransaction } from "ergo-lib-wasm-browser";

export interface DexyUnsignedTX {
    tx: UnsignedTransaction,
    dataInputs: ErgoBoxes,
    inputs: ErgoBoxes
}
