import { Address, ErgoBox, ErgoBoxes, ErgoTree, SecretKey, SecretKeys, Wallet} from "ergo-lib-wasm-browser";
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
                        "boxId": "67276cbfdd766d80db8a81c464f84e7a1b453fbc53cfe70a2033fa88e342f6aa",
                        "value": 1000000,
                        "ergoTree": "101d04020402040204020402040405c80104000404040004d00f040405c80104000e20861a3a5250655368566d597133743677397a24432646294a404d635166546a5704000e20361a3a5250655368566d597133743677397a24432646294a404d635166546a5704000e20472b4b6250655368566d597133743677397a24432646294a404d635166546a5704000e20161a3a5250655368566d597133743677397a24432646294a404d635166546a6904c801040a04d60f05000404050005c40105cc01d814d601b2a4730000d602db63087201d603b2a5730100d604998cb27202730200028cb2db6308720373030002d605e4c6a70404d606db6501fed607b27206730400d608db63087207d6098cb2720873050002d60a9591a372059d72097306e4c6a70505d60bb27206730700d60cb2a4730800d60db2a5730900d60ee4c6720d0404d60f99c17203c17201d610e4c6720b0405d611730ad61299c1b2a5730b00c1720cd6139dc172077209d6149c7210730cd1ededededededed907204720a938cb27202730d0001730e938cb27208730f00017310938cb2db6308720b731100017312938cb2db6308720c731300017314edededed93db6308720ddb6308a793c2720dc2a792c1720dc1a793e4c6720d050599720a72049590a3720593720e7205d801d6159aa37315ed92720e721590720e9a72157316eded92720f9c72049d9c72107e7317057e72110591720f7318ed9272129c72049d9c72107e7319057e721105917212731aed8f9c731b721372148f72149c731c7213",
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
                        "boxId": "efc9ee45a7a4040df37347109e79354994d81e2b37b6f3f2329bda7e8934117e",
                        "value": 1000000,
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
                )),
                buyBackIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "103361b9fcd42f7aa98f1397fd15b836578faebfa804a099a74f08de083102fc",
                        "value": 10000000000000,
                        "ergoTree": "10230400040004020402040204000e20472b4b6250655368566d597133743677397a24432646294a404d635166546a57040404000400040004020e206d597133743677397a244326462948404d635166546a576e5a723475377821410500040405c80105d201040004020404040404000400040004000e20472b4b6250655368566d597133743677397a24432646294a404d635166546a570400040204020402043c04000e202a472d4a614e645267556b58703273357638792f423f4528482b4d625065536801000404d801d601e4e30004959372017300d808d602b2a4730100d603db63087202d604b2a5730200d605db63087204d606db6308a7d607998cb27205730300028cb2720673040002d60899c1a7c17204d609c17202d1ededed938cb27203730500017306afb4a57307b1a5d9010a6393b1db6308720a7308ed938cb27205730900018cb27206730a0001938cb27205730b0001730ceded917207730d9072089c9d9c9d72098cb27203730e00027207730f73109399c1b2a573110072097208959372017312d801d602b2a5731300d1eded93db63087202db6308a793c27202c2a78fc1a7c17202d804d602b2a5731400d603db6308a7d604b2a4731500d605db63087204d1ededed93b2db63087202731600b2720373170093c27202c2a793c1a7c17202ed938cb27205731800017319928cb2db6308b2a5731a00731b0002999a8cb27205731c00028cb27203731d00027e9cb1b5a4d901066395e6c672060605eded928cc772060199a3731e938cb2db63087206731f0001732093e4c672060504e4c6720405047321732205",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "161a3a5250655368566d597133743677397a24432646294a404d635166546a69",
                                "amount": 1
                            }
                        ],
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
                data.buyBackIn,
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
