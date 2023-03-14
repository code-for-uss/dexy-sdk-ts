import { Address, ErgoBox, ErgoBoxes, ErgoTree, SecretKey, SecretKeys, Wallet} from "ergo-lib-wasm-nodejs";
import { FreeMint } from "../src";
import defaultCtx from "./data/context.data";

// TODO: tests don't work due to a problem between jest and browser wasm
describe('Free Mint', () => {
    describe('but token', () => {

        test('should correctly create mint tx', async () => {
            const data = {
                txFee: 10000000,
                freeMintIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "07180ea7aa4a4106a2154647af18a5f06eec40040090267384c1ac41ffe188f2",
                        "value": 300000,
                        "ergoTree": "101704020402040204020402040405c8010400040005c80104000e20861a3a5250655368566d597133743677397a24432646294a404d635166546a5704000e20361a3a5250655368566d597133743677397a24432646294a404d635166546a5704000e20472b4b6250655368566d597133743677397a24432646294a404d635166546a5704c801040a04e40f04d00f050005c40105cc01d811d601b2a4730000d602db63087201d603b2a5730100d604998cb27202730200028cb2db6308720373030002d605e4c6a70404d606db6501fed607b27206730400d608db63087207d6098cb2720873050002d60a9591a372059d72097306e4c6a70505d60bb27206730700d60cb2a5730800d60de4c6720c0404d60e99c17203c17201d60fe4c6720b0405d6109dc172077209d6119c720f7309d1edededededed907204720a938cb27202730a0001730b938cb27208730c0001730d938cb2db6308720b730e0001730fedededed93db6308720cdb6308a793c2720cc2a792c1720cc1a793e4c6720c050599720a72049590a3720593720d7205d801d6129aa37310ed92720d721290720d9a72127311ed92720e9c72049d9c720f7e7312057e73130591720e7314ed8f9c7315721072118f72119c73167210",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "061a3a5250655368566d597133743677397a24432646294a404d635166546a57",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {
                            "R4": "04ac880f",
                            "R5": "0580dac409"
                        },
                        "transactionId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b806",
                        "index": 1
                    }
                )),
                lpIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "242e21dd02374d1f23fc3eeaed9da0f972489726fb806fa896b57f70d7d6dc72",
                        "value": 100000000000000,
                        "ergoTree": "1013040004020402040404020400040004000404040404060e20161a3a5250655368566d597133743677397a24432646294a404d635166546a510e20161a3a5250655368566d597133743677397a24432646294a404d635166546a500e20161a3a5250655368566d597133743677397a24432646294a404d635166546a59040004000e20161a3a5250655368566d597133743677397a24432646294a404d635166546a570e20161a3a5250655368566d597133743677397a24432646294a404d635166546a540500d807d601b2a5730000d602db6308a7d603db63087201d604b27203730100d605b27202730200d606db6308b2a4730300d6078cb2db6308b2a473040073050001d1ededededed93c27201c2a793b27202730600b27203730700938c7204018c720501938cb27203730800018cb272027309000193b17203730aececec937207730b937207730c937207730dedeced91b17206730e938cb27206730f00017310937207731193998c7205028c7204027312",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "361a3a5250655368566d597133743677397a24432646294a404d635166546a57",
                                "amount": 1
                            },
                            {
                                "tokenId": "4b2d8b7beb3eaac8234d9e61792d270898a43934d6a27275e4f3a044609c9f2a",
                                "amount": 100000000
                            },
                            {
                                "tokenId": "4b2d8b7beb3eaac8234d9e61792d270898a43934d6a27275e4f3a044609c9f2b",
                                "amount": 10000000000
                            }
                        ],
                        "additionalRegisters": {},
                        "transactionId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b807",
                        "index": 1
                    }
                )),
                oracleBox: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "d85432b6e081dd6210bbef37bdfde68990cc2114fa7e1b90869b35edb8b57f8e",
                        "value": 300000,
                        "ergoTree": "10010101d17300",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "472b4b6250655368566d597133743677397a24432646294a404d635166546a57",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {
                            "R4": "05a09c01"
                        },
                        "transactionId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b808",
                        "index": 1
                    }
                )),
                bankIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "6c299a496674e6c3458efd883e5a5c7555bbbdfb90d281efc6f43471f5008eb9",
                        "value": 100000000000000,
                        "ergoTree": "100d04020400040004000400040204020e20061a3a5250655368566d597133743677397a24432646294a404d635166546a570e20961a3a5250655368566d597133743677397a24432646294a404d635166546a57040404000e20161a3a5250655368566d597133743677397a24432646294a404d635166546a570e20161a3a5250655368566d597133743677397a24432646294a404d635166546a52d804d601b2a5730000d602db63087201d603db6308a7d6048cb2db6308b2a473010073020001d1ededed93b27202730300b2720373040093c27201c2a7938cb27202730500018cb2720373060001ececec93720473079372047308938cb2db6308b2a4730900730a0001730b937204730c",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "861a3a5250655368566d597133743677397a24432646294a404d635166546a57",
                                "amount": 1
                            },
                            {
                                "tokenId": "4b2d8b7beb3eaac8234d9e61792d270898a43934d6a27275e4f3a044609c9f2b",
                                "amount": 90200000100
                            }
                        ],
                        "additionalRegisters": {},
                        "transactionId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b806",
                        "index": 1
                    }
                )),
                userIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "db0532a8720ecb39365c86f6102ef6d07904c6d3fe6fae612235ff407a7e5844",
                        "value": 10000000000000,
                        "ergoTree": "10010101d17300",
                        "creationHeight": 123414,
                        "assets": [],
                        "additionalRegisters": {},
                        "transactionId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b809",
                        "index": 1
                    }
                ))
            }
            const userBoxes = new ErgoBoxes(data.userIn)
            const freeMint = new FreeMint()
            const freeMintTx = freeMint.createFreeMintTransaction(
                data.txFee,
                35000,
                data.freeMintIn,
                data.bankIn,
                userBoxes,
                data.lpIn,
                Address.recreate_from_ergo_tree(ErgoTree.from_base16_bytes("10010101d17300")),
                data.oracleBox,
                123414
            )

            const alice_secret = SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from("f96adda371be9dd3578f532653067529b4912abe4707bd0e860bd36229714293", "hex")));
            const sks_alice = new SecretKeys();
            sks_alice.add(alice_secret);
            const wallet_alice = Wallet.from_secrets(sks_alice);
            const sign_transaction = wallet_alice.sign_transaction(defaultCtx, freeMintTx.tx, freeMintTx.inputs, freeMintTx.dataInputs)
            await expect(sign_transaction.to_json()).not.toBeNull();
        });
    });
});
