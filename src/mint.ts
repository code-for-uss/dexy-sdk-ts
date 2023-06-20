import type { ErgoBox } from "ergo-lib-wasm-browser";
import { Dexy } from "./mint/dexy";
import { FreeMint } from "./mint/freeMint";
import { ArbitrageMint } from "./mint/arbitrageMint";

class Mint extends Dexy {

    private MintType = {
        freeMint: "freeMint",
        arbMint: "arbMint"
    }

    constructor(oracleBox: ErgoBox, lpBox: ErgoBox) {
        super(oracleBox, lpBox);
    }

    mintType() {
        if (this.validThreshold())
            return this.MintType.arbMint
        else if (this.validRateFreeMint())
            return this.MintType.freeMint
        else
            return undefined
    }

    getMintObject() {
        const mintType = this.mintType()
        if (mintType == this.MintType.arbMint)
            return new ArbitrageMint(this.oracleBox, this.lpBox)
        else if (mintType == this.MintType.freeMint)
            return new FreeMint(this.oracleBox, this.lpBox)
        else
            return undefined
    }
}

export { Mint }
