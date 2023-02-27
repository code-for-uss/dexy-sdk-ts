import { Address, ErgoBox, ErgoBoxes, ErgoTree, SecretKey, SecretKeys, Wallet, PreHeader, BlockHeaders, ErgoStateContext} from "ergo-lib-wasm-browser";
import { FreeMint } from "../src";

// TODO: tests don't work due to a problem between jest and browser wasm
describe('Free Mint', () => {
    describe('but token', () => {

        test('should correctly create mint tx', async () => {
            const data = {
                txFee: 10000000,
                freeMintIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "ca341a33072376bee8a094b8fd7d436be7d7186830b587f4cc9ce98451039ee9",
                        "value": 2000000000,
                        "ergoTree": "101704020402040204020402040405c8010400040004e40f04d00f05c80104000e20f7ef73c4a4ab91b84bb0a2905108d534114472ec057be3a57a9dfc9b1fbd85c104000e207a0f96f3bdbd2731df58941c62e69fc5e9750ebb5780ae67d4d76528cd8109ae04000e20011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f04c801040a050005c40105cc01d811d601b2a4730000d602db63087201d603b2a5730100d604998cb27202730200028cb2db6308720373030002d605e4c6a70404d606db6501fed607b27206730400d608db63087207d6098cb2720873050002d60a9591a372059d72097306e4c6a70505d60bb27206730700d60cb2a5730800d60de4c6720c0404d60e99c17203c17201d60f9d9ce4c6720b04057e7309057e730a05d6109dc172077209d6119c720f730bd1edededededed907204720a938cb27202730c0001730d938cb27208730e0001730f938cb2db6308720b731000017311edededed93db6308720cdb6308a793c2720cc2a792c1720cc1a793e4c6720c050599720a72049590a3720593720d7205d801d6129aa37312ed92720d721290720d9a72127313ed92720e9c7204720f91720e7314ed8f9c7315721072118f72119c73167210",
                        "creationHeight": 948162,
                        "assets": [
                            {
                                "tokenId": "3f822800c12abd5ff2aeae9f62e9091eeb4669d8349090fa4bf911504730aade",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {
                            "R4": "0480897a",
                            "R5": "058080b4ccd4dfc603"
                        },
                        "transactionId": "55c0537aafa6932c9a25c856fcd064d317af96a4fa733012c26d836bbaf5689a",
                        "index": 1
                    }
                )),
                lpIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "336e472901171f664a9da8467724717bb0ba71ac2fe535d6123929ac1b949b82",
                        "value": 10806126325195,
                        "ergoTree": "101a040004000e20011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f040404040500040604d00f040605000400040004000402040204060500050005c40105c80104040400040204000e20df00abb731c1b43df6e29f9846826f805b0fafcf8778b0ed7cbc5913f934a6860580dac409d81bd601b2a5730000d602e4c672010405d603b2db6501fe730100d6047302d605db63087201d606db6308a7d607b27205730300d608b27206730400d609e4c6a70405d60a9972027209d60bc17201d60cc1a7d60d99720b720cd60e91720d7305d60f8c720802d6107e720f06d6117e720d06d6127306d613998c720702720fd6147e720c06d6157307d6167308d6177e721306d6187e720a06d6197e720906d61a9c72117219d61b9c72177219d1edededededededed927202730993c27201c2a7938cb2db63087203730a0001720493b27205730b00b27206730c00938cb27205730d00018cb27206730e0001938c7207018c72080193b17205730fec9593720a731095720e929c9c721072117e7212069c7ef07213069a9c72147e7215067e9c720d7e72160506929c9c721472177e7212069c7ef0720d069a9c72107e7215067e9c72137e7216050695ed720e9172137311907218a19d721a72149d721b7210eded92721a9c7218721492721b9c7218721091e4c6720304059d9c9d720c720f73127313ec938cb2db6308b2a4731400731500017204938cb2db6308b2a473160073170001731891720b7319",
                        "creationHeight": 946026,
                        "assets": [
                            {
                                "tokenId": "7a0f96f3bdbd2731df58941c62e69fc5e9750ebb5780ae67d4d76528cd8109ae",
                                "amount": 1
                            },
                            {
                                "tokenId": "adfd114c8b145dd758248c9dadf818927da3a7cd56bbe4129ba053d1ce0cbc30",
                                "amount": 1000000000000000
                            },
                            {
                                "tokenId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b809",
                                "amount": 18508
                            }
                        ],
                        "additionalRegisters": {},
                        "transactionId": "adfd114c8b145dd758248c9dadf818927da3a7cd56bbe4129ba053d1ce0cbc30",
                        "index": 0
                    }
                )),
                oracleBox: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "231bf1afa26f4b2a72bc1864b478542ef2c21cf6eb545d3f4c72612bb418b4f7",
                        "value": 2000000000,
                        "ergoTree": "10010101d17300",
                        "creationHeight": 946026,
                        "assets": [
                            {
                                "tokenId": "011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {
                            "R4": "05a682caad04"
                        },
                        "transactionId": "96be1e2f79bfb4ef587b4480966efe9e90f0dddd89c616a1f65222ea2ac4e351",
                        "index": 0
                    }
                )),
                bankIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "d01f7a5f4b61043fcbcbe41483b7a9287463d071f69fc6755a1cc8ecf73f9548",
                        "value": 11610,
                        "ergoTree": "100d04020400040004000400040204020e203f822800c12abd5ff2aeae9f62e9091eeb4669d8349090fa4bf911504730aade0e20361a3a5250655368566d597133743677397a24432646294a404d635166546a57040404000e20011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f0e20a99f5777a9e6fa886455491b25a8acb4fe1151f4a9cb378968e48bd593691f3dd804d601b2a5730000d602db63087201d603db6308a7d6048cb2db6308b2a473010073020001d1ededed93b27202730300b2720373040093c27201c2a7938cb27202730500018cb2720373060001ececec93720473079372047308938cb2db6308b2a4730900730a0001730b937204730c",
                        "creationHeight": 946026,
                        "assets": [
                            {
                                "tokenId": "f7ef73c4a4ab91b84bb0a2905108d534114472ec057be3a57a9dfc9b1fbd85c1",
                                "amount": 1
                            },
                            {
                                "tokenId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b809",
                                "amount": 1000000000000000
                            }
                        ],
                        "additionalRegisters": {},
                        "transactionId": "ce552663312afc2379a91f803c93e2b10b424f176fbc930055c10def2fd88a5d",
                        "index": 0
                    }
                )),
                userIn: ErgoBox.from_json(JSON.stringify(
                    {
                        "boxId": "e23f46764ef7368da5d60a5d3cdc8dc6b579cabdf19d4ebf8f1647dc4738e869",
                        "value": 4000000000000,
                        "ergoTree": "0008cd0331dda82d6aef6c1f7c76d72bab01be2c40f03294fc24f3745551a8d656023662",
                        "creationHeight": 948149,
                        "assets": [],
                        "additionalRegisters": {},
                        "transactionId": "b84e555e05181c1c8cf661535bb197853fe4ec2299f2fd399ba7bb1e73f5e69b",
                        "index": 0
                    }
                ))
            }
            const userBoxes = new ErgoBoxes(data.userIn)
            const freeMint = new FreeMint()
            const freeMintTx = freeMint.createFreeMintTransaction(
                data.txFee,
                1,
                data.freeMintIn,
                data.bankIn,
                userBoxes,
                data.lpIn,
                Address.recreate_from_ergo_tree(ErgoTree.from_base16_bytes("10010101d17300")),
                data.oracleBox,
                946030
            )

            const expectedTx = {
                "id": "b07a0b68dfd1c54aa9d917a426b60ee5af6a654723bb5977fe418eec49dfe5ad",
                "inputs": [
                    {
                        "boxId": "ca341a33072376bee8a094b8fd7d436be7d7186830b587f4cc9ce98451039ee9",
                        "spendingProof": {
                            "proofBytes": "",
                            "extension": {}
                        }
                    },
                    {
                        "boxId": "d01f7a5f4b61043fcbcbe41483b7a9287463d071f69fc6755a1cc8ecf73f9548",
                        "spendingProof": {
                            "proofBytes": "",
                            "extension": {}
                        }
                    },
                    {
                        "boxId": "e23f46764ef7368da5d60a5d3cdc8dc6b579cabdf19d4ebf8f1647dc4738e869",
                        "spendingProof": {
                            "proofBytes": "abe07d68f005f345f2b4c3f41da31e41134152e165478d97be9b760f0f2ad17cc8c144b2015e177529a5dd16d7fb91d0f38d75fc2ff99707",
                            "extension": {}
                        }
                    }
                ],
                "dataInputs": [
                    {
                        "boxId": "231bf1afa26f4b2a72bc1864b478542ef2c21cf6eb545d3f4c72612bb418b4f7"
                    },
                    {
                        "boxId": "336e472901171f664a9da8467724717bb0ba71ac2fe535d6123929ac1b949b82"
                    }
                ],
                "outputs": [
                    {
                        "boxId": "86188ca6faf0eeadfc3ae3e01131e1b96c3f85d3d3b79535d7a8efee9cd578c2",
                        "value": 2000000000,
                        "ergoTree": "101704020402040204020402040405c8010400040004e40f04d00f05c80104000e20f7ef73c4a4ab91b84bb0a2905108d534114472ec057be3a57a9dfc9b1fbd85c104000e207a0f96f3bdbd2731df58941c62e69fc5e9750ebb5780ae67d4d76528cd8109ae04000e20011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f04c801040a050005c40105cc01d811d601b2a4730000d602db63087201d603b2a5730100d604998cb27202730200028cb2db6308720373030002d605e4c6a70404d606db6501fed607b27206730400d608db63087207d6098cb2720873050002d60a9591a372059d72097306e4c6a70505d60bb27206730700d60cb2a5730800d60de4c6720c0404d60e99c17203c17201d60f9d9ce4c6720b04057e7309057e730a05d6109dc172077209d6119c720f730bd1edededededed907204720a938cb27202730c0001730d938cb27208730e0001730f938cb2db6308720b731000017311edededed93db6308720cdb6308a793c2720cc2a792c1720cc1a793e4c6720c050599720a72049590a3720593720d7205d801d6129aa37312ed92720d721290720d9a72127313ed92720e9c7204720f91720e7314ed8f9c7315721072118f72119c73167210",
                        "assets": [
                            {
                                "tokenId": "3f822800c12abd5ff2aeae9f62e9091eeb4669d8349090fa4bf911504730aade",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {
                            "R4": "0480897a",
                            "R5": "05feffb3ccd4dfc603"
                        },
                        "creationHeight": 946030,
                        "transactionId": "b07a0b68dfd1c54aa9d917a426b60ee5af6a654723bb5977fe418eec49dfe5ad",
                        "index": 0
                    },
                    {
                        "boxId": "c51a02e742aa9e0431571ec2dd38ccc767d8c59610da6eea464ef8cb67850295",
                        "value": 590509830480,
                        "ergoTree": "100d04020400040004000400040204020e203f822800c12abd5ff2aeae9f62e9091eeb4669d8349090fa4bf911504730aade0e20361a3a5250655368566d597133743677397a24432646294a404d635166546a57040404000e20011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f0e20a99f5777a9e6fa886455491b25a8acb4fe1151f4a9cb378968e48bd593691f3dd804d601b2a5730000d602db63087201d603db6308a7d6048cb2db6308b2a473010073020001d1ededed93b27202730300b2720373040093c27201c2a7938cb27202730500018cb2720373060001ececec93720473079372047308938cb2db6308b2a4730900730a0001730b937204730c",
                        "assets": [
                            {
                                "tokenId": "f7ef73c4a4ab91b84bb0a2905108d534114472ec057be3a57a9dfc9b1fbd85c1",
                                "amount": 1
                            },
                            {
                                "tokenId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b809",
                                "amount": 999999999999999
                            }
                        ],
                        "additionalRegisters": {},
                        "creationHeight": 946030,
                        "transactionId": "b07a0b68dfd1c54aa9d917a426b60ee5af6a654723bb5977fe418eec49dfe5ad",
                        "index": 1
                    },
                    {
                        "boxId": "9be7bbefa93062385afb507a31df12a950fe084e574ac8e00ad9537548a8db37",
                        "value": 3409480181130,
                        "ergoTree": "10010101d17300",
                        "assets": [
                            {
                                "tokenId": "f9e5ce5aa0d95f5d54a7bc89c46730d9662397067250aa18a0039631c0f5b809",
                                "amount": 1
                            }
                        ],
                        "additionalRegisters": {},
                        "creationHeight": 946030,
                        "transactionId": "b07a0b68dfd1c54aa9d917a426b60ee5af6a654723bb5977fe418eec49dfe5ad",
                        "index": 2
                    },
                    {
                        "boxId": "03d8357428355f8fccafa6c726d80f7320f8704883e5e5d1004b9eb258954304",
                        "value": 10000000,
                        "ergoTree": "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
                        "assets": [],
                        "additionalRegisters": {},
                        "creationHeight": 946030,
                        "transactionId": "b07a0b68dfd1c54aa9d917a426b60ee5af6a654723bb5977fe418eec49dfe5ad",
                        "index": 3
                    }
                ]
            }
            const blockHeaders = BlockHeaders.from_json([
                {
                    "extensionId": "dfa2eb01c10adb7a9930be208dab3132863617f972c202e431e02adae1f3a538",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677343910303,
                    "size": 220,
                    "stateRoot": "7a7959e333c65652a0b71702401482b0fbe34c5ca7b0cb0ee1299d827a74212f19",
                    "height": 948126,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "d0892a369950680897f6191b0d07e91dac7804ae5043b2bfa6bb67be34bd97b7",
                    "adProofsRoot": "8c071ad21e2d71651004afba19349791c007a242a6e8b59f8fcd3d8463e5e8eb",
                    "transactionsRoot": "b83dc05a2125d4a5b22ecbbbb831796645bfb6ade289691a84523d076462b4b6",
                    "extensionHash": "14cbc6333789122414d2edc1166d7cef1dbd1f3621bb20d6f9da0fb10137fd48",
                    "powSolutions": {
                        "pk": "028deb6618b1e889f1087659f82ae7041f4431256a66e79a06e1f652885252b7e4",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "6db7b20809905345",
                        "d": 0
                    },
                    "adProofsId": "43306740f9ff32db94e17a081cb3630e926cbef068afd7edfb1b92cf2a8b96b1",
                    "transactionsId": "516db7c05b45b00d5988c815f10c2d3fbe1ad61c774d95dab607c90169999a49",
                    "parentId": "0262ec44031f2d40396fff94d08645629ca9ffc22edd049dabb00e5a03aba549"
                },
                {
                    "extensionId": "2ecb4d58d2e2c39287ad1cbde2ee6aeda4096df5f967611be6f45e235d63d35c",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677343964396,
                    "size": 220,
                    "stateRoot": "3baeccccf770cbc1aa3664b5a14e75882b279e5894ba1d49ea90351b9951fbe619",
                    "height": 948127,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "444bbeb1bb3cf414d55df6169bc4a0c6209d751ede57e20e9003cae393e05277",
                    "adProofsRoot": "60d5671a49ece3e4544dc985809a7dc44cb2380747d60b5669f2d590281db0ee",
                    "transactionsRoot": "3f9d4ff0b9116f0b71cc8bd8d68466aac1fc8a9e0d4612ef77881184a06a9ec9",
                    "extensionHash": "14cbc6333789122414d2edc1166d7cef1dbd1f3621bb20d6f9da0fb10137fd48",
                    "powSolutions": {
                        "pk": "02f5924b14325a1ffa8f95f8c00006118728ce3785a648e8b269820a3d3bdfd40d",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "67f70021558534da",
                        "d": 0
                    },
                    "adProofsId": "b5f970359402b63bb5d59a4f69370c56139e8db0eeb57ae07fed9e9c3252f1e8",
                    "transactionsId": "461b93ece2128d3daf62fa504cc327fc3d3a587295b81a693071a1ef8958f938",
                    "parentId": "d0892a369950680897f6191b0d07e91dac7804ae5043b2bfa6bb67be34bd97b7"
                },
                {
                    "extensionId": "789cdfa550a4eb5cc783697eedde72e00fda82c5bb6c3a39223eb0d6e7749ecd",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677344113635,
                    "size": 220,
                    "stateRoot": "6c63746688ef38687e632758e37d8ae5f1181b802eb31f553882cff32b3cdced19",
                    "height": 948128,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "a934c0afe2d056a337bb6c0a6461d2ed8e7d066d4ec50233a4994712faec3af4",
                    "adProofsRoot": "744cf931036f5fc27c717b808833b6e212dc2f7473faff44e54c89d32117ad6e",
                    "transactionsRoot": "3a362447e6bc7ad851042277abcccd7d2acb47082e46c2a7f82209f008fcac4e",
                    "extensionHash": "571fe9b5a709e826e1361c04584691dbf1f7a20691701527cbf098864f9f30cb",
                    "powSolutions": {
                        "pk": "0295facb78290ac2b55f1453204d49df37be5bae9f185ed6704c1ba3ee372280c1",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "5f2d0005e473d15a",
                        "d": 0
                    },
                    "adProofsId": "b0574e676d26214791a60a18f3eb4f3b951dcfb7c5d52256e4e8a9e0df9e7348",
                    "transactionsId": "b00343c9cbcef6b76df80cf3f20ee4c1363fa7388421ff7e0d4fd37fa6cac7c8",
                    "parentId": "444bbeb1bb3cf414d55df6169bc4a0c6209d751ede57e20e9003cae393e05277"
                },
                {
                    "extensionId": "9feee5b5656fa57362e3bd5e9c0b92c78f4d6795b031e7edf1b3199b2b5dfd5c",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677344192672,
                    "size": 220,
                    "stateRoot": "c6e8b89d85312cb20f17639f3f608d5f870571f5265864c72205d4b349653a2119",
                    "height": 948129,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "76351932d4b3c4fd9c2a2ebd66131544caa9ea51895dc911ca950f14bab2f401",
                    "adProofsRoot": "95657974657be034154446a1d8415a6ebf45c39434bf3a024f6dbe40cc5500c4",
                    "transactionsRoot": "510ce0912c68116e0855b1ab3a191d23e7781c32213b2f7049cf0ed235d2366e",
                    "extensionHash": "571fe9b5a709e826e1361c04584691dbf1f7a20691701527cbf098864f9f30cb",
                    "powSolutions": {
                        "pk": "0295facb78290ac2b55f1453204d49df37be5bae9f185ed6704c1ba3ee372280c1",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "0106b852000c9a93",
                        "d": 0
                    },
                    "adProofsId": "0e033cedd3aacfe72f1445942bf7881161d06c9387c952662598a48f11085a37",
                    "transactionsId": "a44504e094bf51b145d8db19d52a9ff569f181a7b7fe01a5fa10ccde1f446830",
                    "parentId": "a934c0afe2d056a337bb6c0a6461d2ed8e7d066d4ec50233a4994712faec3af4"
                },
                {
                    "extensionId": "3ff81473bc80c6c0e91ee33dcc214561fc690f27dec06f1e8d1028f0fb78e7e4",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677344948049,
                    "size": 220,
                    "stateRoot": "a277c67bc439c45bf73b609d4cdbaf80ea9a3d0eb1032412d8e7dd88ab2c058019",
                    "height": 948130,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "82a463b55ad6ec86b8ffa1e4297314129b5389c3cd0357b7b0255e238031cf4e",
                    "adProofsRoot": "2bb539608a9386ea1a28db320df66130b36e1a768b89649194ec79f1e66d0825",
                    "transactionsRoot": "406e5564421be39d6fc4ba864940815f0f9f92eb28bd34d9accefedb3f544fc3",
                    "extensionHash": "571fe9b5a709e826e1361c04584691dbf1f7a20691701527cbf098864f9f30cb",
                    "powSolutions": {
                        "pk": "03b3fc3769bc7813f6287e130ea627b5350fd4709b359311606a1cc48d298cbfa7",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "802952b7d053427b",
                        "d": 0
                    },
                    "adProofsId": "90d33c7293fedee4e63f9c951d3326aeb33337818cea8a8824806608b2b2ea94",
                    "transactionsId": "ea50d1f1e85b123fac8c03abc2660ddc323b0864f45bc0a3d49c3bfb8897ef79",
                    "parentId": "76351932d4b3c4fd9c2a2ebd66131544caa9ea51895dc911ca950f14bab2f401"
                },
                {
                    "extensionId": "ba210796fed77ac0e551dc624ff25a3cf89a225727415958811d736bed8b3a3b",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677344955577,
                    "size": 220,
                    "stateRoot": "3f17224ab4217d4a677529dc08c3cf431139aa18af0fd49d7ba9441134de19e119",
                    "height": 948131,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "329f54605aeb419089e5ca4726133ea2fa9b1cc5bd615b4ed355e2a632c0f1d5",
                    "adProofsRoot": "f14d42beb340e8d7ae18af3f3e9cb72ef5cd4162f91c13e7c08c061f5ab0d70a",
                    "transactionsRoot": "9f1ae300d8f5c8ae954eed02aa2430f13f97dbae9960563cd4a5e5c444106fb7",
                    "extensionHash": "571fe9b5a709e826e1361c04584691dbf1f7a20691701527cbf098864f9f30cb",
                    "powSolutions": {
                        "pk": "0274e729bb6615cbda94d9d176a2f1525068f12b330e38bbbf387232797dfd891f",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "c2b8001ea82bf037",
                        "d": 0
                    },
                    "adProofsId": "6c4a8444c07788210eb311e53fa772941f4d3023944030ef0f1e3b815f8cf37b",
                    "transactionsId": "e61d68d7d7b2640ac0e741c8724fb83249e380075694d7fa42c8d7bbe6e00ea8",
                    "parentId": "82a463b55ad6ec86b8ffa1e4297314129b5389c3cd0357b7b0255e238031cf4e"
                },
                {
                    "extensionId": "cafcc2cbc67f9facdf5e7d77a1aa37d259fd0ddf70b4df366a6a04e84b002c1c",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677345131461,
                    "size": 220,
                    "stateRoot": "aa69ce2d7b6ef9b8b4654427baaa449a7f5fe254db5f895cdfaff0da6ab9c10919",
                    "height": 948132,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "3673bea8cc5d93ecec9cda43269dbb05cd5d83faa93b07e37c26c111533c58e3",
                    "adProofsRoot": "f9277088ba671defeeaf7d1fdd79d32b8a743ea4deaf5b52dfc3d3012f4791cf",
                    "transactionsRoot": "5d6b3a6fe60251cc0f490133ddfcc5b0898e239b70334675d0fdb850700e5bab",
                    "extensionHash": "5f7cccd229324d451d99f30e6d1737fbe386fbab687a8451802213b042fc62e8",
                    "powSolutions": {
                        "pk": "0274e729bb6615cbda94d9d176a2f1525068f12b330e38bbbf387232797dfd891f",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "4c1e88ecd41835f2",
                        "d": 0
                    },
                    "adProofsId": "ede75d8ce96bdacd10d31202497dcc72ca624512fad1a75b922ca5ca23ccd6cb",
                    "transactionsId": "b8743ee445696100364068d3838c371dfab6066bcae7450ed1c6493696eb1e4b",
                    "parentId": "329f54605aeb419089e5ca4726133ea2fa9b1cc5bd615b4ed355e2a632c0f1d5"
                },
                {
                    "extensionId": "9fec717a94749c4abf96eba22beccf555e2fc3a36a3cbb3e0f5044edfde1b5df",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677345332919,
                    "size": 220,
                    "stateRoot": "4d0e88b0e37c3971af2e877a7e13933484586ce27a7418806744f6a8334c896519",
                    "height": 948133,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "6785407dc8053a21530c09509e56aeb389883ab6aa047ef3169b55a62bb9e036",
                    "adProofsRoot": "b93a9bf02334b044c79f4819c7923b7e5022de8d54212f82c842d67e1db59025",
                    "transactionsRoot": "4df7fd81ac186a2e54ec3aff465affee2298eca47ac85b183b431f02a679e2bf",
                    "extensionHash": "5f7cccd229324d451d99f30e6d1737fbe386fbab687a8451802213b042fc62e8",
                    "powSolutions": {
                        "pk": "0274e729bb6615cbda94d9d176a2f1525068f12b330e38bbbf387232797dfd891f",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "3b3d90fe38d3b70a",
                        "d": 0
                    },
                    "adProofsId": "3684255e6dc311e4053b1f011d38daae987dbc71a7cef9d78912aef9fe7e487c",
                    "transactionsId": "0a27cd12aaf8daee09a991aa6922e2636d95bb7f5ba21cd1eb7bbb85d1c1e9a8",
                    "parentId": "3673bea8cc5d93ecec9cda43269dbb05cd5d83faa93b07e37c26c111533c58e3"
                },
                {
                    "extensionId": "73c469df0ae5678682571cd42c85976d0fb57166c191bcba327065f6605012a1",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677345380241,
                    "size": 220,
                    "stateRoot": "c3d451be70899346b88dfde9eb7d0606c827fbc5ae10fef3aedf9a786f04affd19",
                    "height": 948134,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "bd6ffc027dd0a7a695d66968d15fbe2ead4fa582db23a527ecaf42d618b331a2",
                    "adProofsRoot": "b80770b7719c51b8ed61b0632b23cc1bfb4bed3b7203f460fe69d6a186080d29",
                    "transactionsRoot": "234eb18857e738619a7c92ab8c347a99ccf3806ec5607d5baa8a66a7beb0b3e6",
                    "extensionHash": "5f7cccd229324d451d99f30e6d1737fbe386fbab687a8451802213b042fc62e8",
                    "powSolutions": {
                        "pk": "03b3fc3769bc7813f6287e130ea627b5350fd4709b359311606a1cc48d298cbfa7",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "f9ec0196ea896b2f",
                        "d": 0
                    },
                    "adProofsId": "5736851f0057662c1420ff68f42968837bdefbac4938c77be934842b7a6e8134",
                    "transactionsId": "629dd9a626d206824df881862c113697b405af2f0dc0415ddd944799b9ba92c5",
                    "parentId": "6785407dc8053a21530c09509e56aeb389883ab6aa047ef3169b55a62bb9e036"
                },
                {
                    "extensionId": "c2a5ea1ea54902e5619c68243d25a28a9958c3b2e6a6c17809655f0eefb52ebc",
                    "difficulty": "3552998810714112",
                    "votes": "000000",
                    "timestamp": 1677345455914,
                    "size": 220,
                    "stateRoot": "d0a4b3c006732763cc174e8e1efef6d2d4d4bcf6e3fa944a907caed5b9f06eee19",
                    "height": 948135,
                    "nBits": 118267759,
                    "version": 3,
                    "id": "91c77b60d72ec39a28b18948c90866c06239d6a94896225fc48e1da4f4c764f6",
                    "adProofsRoot": "c8ff7d958b57b4e1d7d18aa52e0138ab805b1290cb6fb5e86604cbc2809e4e6c",
                    "transactionsRoot": "278de9fbd1b89166c7d38eae1ea4f0d69c6939bd89672313544dcf2047eae2de",
                    "extensionHash": "5d347d1f884ca4841f57b5c4c49d0a393104e46496265bef33af2a1a000db136",
                    "powSolutions": {
                        "pk": "02f5924b14325a1ffa8f95f8c00006118728ce3785a648e8b269820a3d3bdfd40d",
                        "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        "n": "a2e0b2a4782f8ae7",
                        "d": 0
                    },
                    "adProofsId": "a24a3e17f267d70bbdfb563424f3ef7b9bcaf4a929b9909a72d1f60fac95a367",
                    "transactionsId": "cbda0ac153ac9368ddcd3ea2d835e2837a253477ec5ae2c9aa1ff0f957e55664",
                    "parentId": "bd6ffc027dd0a7a695d66968d15fbe2ead4fa582db23a527ecaf42d618b331a2"
                }
            ])
            const pre_header = PreHeader.from_block_header(blockHeaders.get(blockHeaders.len() - 1))
            const ctx = new ErgoStateContext(pre_header, blockHeaders);
            const alice_secret = SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from("f96adda371be9dd3578f532653067529b4912abe4707bd0e860bd36229714293", "hex")));
            const sks_alice = new SecretKeys();
            sks_alice.add(alice_secret);
            const wallet_alice = Wallet.from_secrets(sks_alice);
            const sign_transaction = wallet_alice.sign_transaction(ctx, freeMintTx.tx, freeMintTx.inputs, freeMintTx.dataInputs)
            await expect(sign_transaction.to_json()).not.toBeNull();
        });
    });
});
