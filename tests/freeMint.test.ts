import { Address, ErgoBox, ErgoBoxes, ErgoTree, SecretKey, SecretKeys, Wallet} from "ergo-lib-wasm-browser";
import { FreeMint, Mint } from "../src";
import defaultCtx from "./data/context.data";

// TODO: tests don't work due to a problem between jest and browser wasm
describe('Free Mint', () => {
    describe('but token', () => {

        test('should correctly create mint tx', async () => {
            const data = {
                txFee: 1000000,
                freeMintIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "b6a59811ecce9d98023d991ee4a59f54a6f1af957c8f21f335186215cfcacf56",
                        "value": 1000000,
                        "ergoTree": "101e04020402040204020402040405c8010400040404000580897a04d00f040405c80104000e20e6038bb582650c63e9fd30329285b3bc5ed50d56a2318888b0a0b9b77b6292cd04000e20278babbc8093487a641390842042a10cd17c0a37c1c1f67e7491b751841943fd04000e20f2f64bab1f2e9ab65c0e4a6a65eed0b26c5276eb5dda01d4a0e0ebe8a85bfbfc04000e2069221297b61e24a843a3ac2d48edefe1558401fc88927eeac72701d3ff80a4c004c801040a04d60f05000404050005c40105cc01d814d601b2a4730000d602db63087201d603b2a5730100d604998cb27202730200028cb2db6308720373030002d605e4c6a70404d606db6501fed607b27206730400d608db63087207d6098cb2720873050002d60a9591a372059d72097306e4c6a70505d60bb27206730700d60cb2a4730800d60db2a5730900d60ee4c6720d0404d60f99c17203c17201d6109de4c6720b0405730ad611730bd61299c1b2a5730c00c1720cd6139dc172077209d6149c7210730dd1ededededededed907204720a938cb27202730e0001730f938cb27208731000017311938cb2db6308720b731200017313938cb2db6308720c731400017315edededed93db6308720ddb6308a793c2720dc2a792c1720dc1a793e4c6720d050599720a72049590a3720593720e7205d801d6159aa37316ed92720e721590720e9a72157317eded92720f9c72049d9c72107e7318057e72110591720f7319ed9272129c72049d9c72107e731a057e721105917212731bed8f9c731c721372148f72149c731d7213",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "ba57c53a215c8d135ff067e3e7b3a11da64690041a20f659e3a1cc14b1c7ae37",
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
                        "boxId": "10b07ae97d027d3fdeca729820c333f07bce95d4bff166c948c2946bc31fc3cc",
                        "value": 100000000000000,
                        "ergoTree": "1013040004020402040404020400040004000404040404060e2020a1f758cf488566a2ad58116a57386e5d9feb306b8b57df2e00b733a8263a260e2061a44e341441b36466ddbe2148bbe6888b000de1cf115103067855345cc364d60e202676bffc90260934d622f1b78c46ae6bd62f9c2b335e13905010d21254eb6c9d040004000e20e66257a0f046789ecb95893f56a16e4446880b874b763d1f8cdc287abecc6c580e205b3d4c89d43a8520e109f067dd8f0561447e14280d6a3f95b3197f55c1d3a2db0500d807d601b2a5730000d602db6308a7d603db63087201d604b27203730100d605b27202730200d606db6308b2a4730300d6078cb2db6308b2a473040073050001d1ededededed93c27201c2a793b27202730600b27203730700938c7204018c720501938cb27203730800018cb272027309000193b17203730aececec937207730b937207730c937207730dedeced91b17206730e938cb27206730f00017310937207731193998c7205028c7204027312",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "278babbc8093487a641390842042a10cd17c0a37c1c1f67e7491b751841943fd",
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
                        "boxId": "efabfb6cef9a1b0c95005958b9dc8ba2e9b490cb8ecd2998faa7b4445bfdcbe3",
                        "value": 1000000,
                        "ergoTree": "10010101d17300",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "f2f64bab1f2e9ab65c0e4a6a65eed0b26c5276eb5dda01d4a0e0ebe8a85bfbfc",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {
                            "R4": "058090dfc04a"
                        },
                        "transactionId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b808",
                        "index": 1
                    }
                )),
                bankIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "fa409877a7da165de0678fb988911d29455ce7539333d158fe423b405b1484a4",
                        "value": 100000000000000,
                        "ergoTree": "100d04020400040004000400040204020e20ba57c53a215c8d135ff067e3e7b3a11da64690041a20f659e3a1cc14b1c7ae370e2094af8793a1f7b427831dcb48368ffc55c68d319d525ea24510ac38b75e280a8c040404000e20e66257a0f046789ecb95893f56a16e4446880b874b763d1f8cdc287abecc6c580e20c811a10d4a22eaf6738434490f7b53740d09988a661ff20ed00bb71000dbc2a9d804d601b2a5730000d602db63087201d603db6308a7d6048cb2db6308b2a473010073020001d1ededed93b27202730300b2720373040093c27201c2a7938cb27202730500018cb2720373060001ececec93720473079372047308938cb2db6308b2a4730900730a0001730b937204730c",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "e6038bb582650c63e9fd30329285b3bc5ed50d56a2318888b0a0b9b77b6292cd",
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
                        "boxId": "71480a1ab8000aabd730d999430331c6d4a3cbf6fa1f4f03ff7134e63107772b",
                        "value": 10000000000000,
                        "ergoTree": "10230400040004020402040204000e202f51b13d06f4e599cbfd74493701e7f3cdba32c58c567f01ccf1d20f0405d607040404000400040004020e20e2636c9f0e32886954ab1f87ac2e016fdf53d63d8fa2101530d1e31ac59e365f0500040405c80105d201040004020404040404000400040004000e20f2f64bab1f2e9ab65c0e4a6a65eed0b26c5276eb5dda01d4a0e0ebe8a85bfbfc0400040204020402043c04000e20cc8d50d2a9f0f1254f363ee66a3c65e73ea8046386c001544b08841743df411d01000404d801d601e4e30004959372017300d808d602b2a4730100d603db63087202d604b2a5730200d605db63087204d606db6308a7d607998cb27205730300028cb2720673040002d60899c1a7c17204d609c17202d1ededed938cb27203730500017306afb4a57307b1a5d9010a6393b1db6308720a7308ed938cb27205730900018cb27206730a0001938cb27205730b0001730ceded917207730d9072089c9d9c9d72098cb27203730e00027207730f73109399c1b2a573110072097208959372017312d801d602b2a5731300d1eded93db63087202db6308a793c27202c2a78fc1a7c17202d804d602b2a5731400d603db6308a7d604b2a4731500d605db63087204d1ededed93b2db63087202731600b2720373170093c27202c2a793c1a7c17202ed938cb27205731800017319928cb2db6308b2a5731a00731b0002999a8cb27205731c00028cb27203731d00027e9cb1b5a4d901066395e6c672060605eded928cc772060199a3731e938cb2db63087206731f0001732093e4c672060504e4c6720405047321732205",
                        "creationHeight": 123414,
                        "assets": [
                            {
                                "tokenId": "69221297b61e24a843a3ac2d48edefe1558401fc88927eeac72701d3ff80a4c0",
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
            const mint = new Mint(data.oracleBox, data.lpIn)
            await expect(mint.mintType()).toEqual("freeMint")
            const freeMint = new FreeMint(data.oracleBox, data.lpIn)
            const freeMintTx = freeMint.createFreeMintTransaction(
                data.txFee,
                35000,
                data.freeMintIn,
                data.buyBackIn,
                data.bankIn,
                userBoxes,
                Address.recreate_from_ergo_tree(ErgoTree.from_base16_bytes("10010101d17300")),
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
