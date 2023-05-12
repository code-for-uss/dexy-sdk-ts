import { DexyUnsignedTX } from "../interfaces";
import { JSONBI, UnsignedErgoTx, UnsignedInput } from "@ergolabs/ergo-sdk";

const unsignedTxConnectorProxy = (dexyUnsignedTx: DexyUnsignedTX): UnsignedErgoTx => {
    const unsignedTx = JSONBI.parse(dexyUnsignedTx.tx.to_json());
    const inputBoxes = dexyUnsignedTx.inputs;
    const inputs: UnsignedInput[] = [];
    for (let i = 0; i < inputBoxes.len(); i++) {
        const input = JSONBI.parse(inputBoxes.get(i).to_json());
        input.extension = unsignedTx.inputs[i].extension;
        inputs.push(input);
    }

    const dataInputBoxes = dexyUnsignedTx.dataInputs;
    const dataInputs: any[] = [];
    for (let i = 0; i < dataInputBoxes.len(); i++) {
        const data = JSONBI.parse(dataInputBoxes.get(i).to_json());
        dataInputs.push(data);
    }
    unsignedTx.inputs = inputs;
    unsignedTx.dataInputs = dataInputs;

    return unsignedTx
}

export { unsignedTxConnectorProxy }
