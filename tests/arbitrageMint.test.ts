import { Address, ErgoBox, ErgoBoxes, ErgoTree, SecretKey, SecretKeys, Wallet} from "ergo-lib-wasm-nodejs";
import { ArbitrageMint } from "../src";
import defaultCtx from "./data/context.data";

// TODO: tests don't work due to a problem between jest and browser wasm
describe('Arbitrage Mint', () => {
    describe('but token', () => {

        test('should correctly create mint tx', async () => {
            const data = {
                txFee: 1000000,
                arbitrageMintIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "f496c4fb54734f8fb2d3f583ee754042b34726978a9b904d79e7b9cf1306fe2c",
                        "value": 300000,
                        "ergoTree": "1019040404020404040004da0f04d00f04020402040204020400043c05c80104ca0104000e20861a3a5250655368566d597133743677397a24432646294a404d635166546a5704000e20361a3a5250655368566d597133743677397a24432646294a404d635166546a5704000e20472b4b6250655368566d597133743677397a24432646294a404d635166546a5704000e20261a3a5250655368566d597133743677397a24432646294a404d635166546a58043c040a0500d811d601db6501fed602b27201730000d603b27201730100d604c17203d605db63087203d6068cb2720573020002d607b27201730300d6089d9ce4c6720704057e7304057e730505d609b2a4730600d60adb63087209d60bb2a5730700d60c998cb2720a730800028cb2db6308720b73090002d60de4c6a70404d60e9591a3720d9d9972049c720872067208e4c6a70505d60fb2a5730a00d610e4c6720f0404d61199c1720bc17209d1edededededededed8fe4c67202070499a3730b919c9d72047206730c9c7e730d05720890720c720e938cb2720a730e0001730f938cb27205731000017311938cb2db63087207731200017313938cb2db63087202731400017315edededed93db6308720fdb6308a793c2720fc2a792c1720fc1a793e4c6720f050599720e720c9590a3720d937210720dd801d6129aa37316ed92721072129072109a72127317ed9272119c720c72089172117318",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "961a3a5250655368566d597133743677397a24432646294a404d635166546a57",
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
                tracking101: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "e92f1da139d863355cbda58b300de8e1ba814f3e1a6a97becf51c0d35dc4d133",
                        "value": 100000000000000,
                        "ergoTree": "1013040004020402040404020400040004000404040404060e20161a3a5250655368566d597133743677397a24432646294a404d635166546a510e20161a3a5250655368566d597133743677397a24432646294a404d635166546a500e20161a3a5250655368566d597133743677397a24432646294a404d635166546a59040004000e20161a3a5250655368566d597133743677397a24432646294a404d635166546a570e20161a3a5250655368566d597133743677397a24432646294a404d635166546a540500d807d601b2a5730000d602db6308a7d603db63087201d604b27203730100d605b27202730200d606db6308b2a4730300d6078cb2db6308b2a473040073050001d1ededededed93c27201c2a793b27202730600b27203730700938c7204018c720501938cb27203730800018cb272027309000193b17203730aececec937207730b937207730c937207730dedeced91b17206730e938cb27206730f00017310937207731193998c7205028c7204027312",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "261a3a5250655368566d597133743677397a24432646294a404d635166546a58",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {
                            "R4": "04c801",
                            "R5": "04ca01",
                            "R6": "0100",
                            "R7": "04ee870f"
                        },
                        "transactionId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b807",
                        "index": 1
                    }
                )),
                oracleBox: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "48e0244d2646a0ee981769e67510cd3b608d9f93a53d4927c498481388f967c1",
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
                            "R4": "05d08c01"
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
            const arbitrageMint = new ArbitrageMint()
            const arbitrageMintTx = arbitrageMint.createArbitrageMintTransaction(
                data.txFee,
                35000,
                data.arbitrageMintIn,
                data.bankIn,
                userBoxes,
                data.lpIn,
                Address.recreate_from_ergo_tree(ErgoTree.from_base16_bytes("10010101d17300")),
                data.oracleBox,
                data.tracking101,
                123414
            )

            const alice_secret = SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from("f96adda371be9dd3578f532653067529b4912abe4707bd0e860bd36229714293", "hex")));
            const sks_alice = new SecretKeys();
            sks_alice.add(alice_secret);
            const wallet_alice = Wallet.from_secrets(sks_alice);
            const sign_transaction = wallet_alice.sign_transaction(defaultCtx, arbitrageMintTx.tx, arbitrageMintTx.inputs, arbitrageMintTx.dataInputs)
            await expect(sign_transaction.to_json()).not.toBeNull();
        });
    });
});
