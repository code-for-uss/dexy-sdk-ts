import { ErgoBoxes, UnsignedTransaction } from "ergo-lib-wasm-browser";

export type DexyUnsignedTX = {
    tx: UnsignedTransaction,
    dataInputs: ErgoBoxes,
    inputs: ErgoBoxes
};
