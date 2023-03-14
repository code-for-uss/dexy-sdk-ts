import { BlockHeaders, ErgoStateContext, PreHeader } from "ergo-lib-wasm-browser";

const contextData = [
    {
        "id": "57d1b3af4e969cf2a3ed86eb33aca6b03cd40d1dafa656d5364b60ba62d7fbc5",
        "timestamp": 1576787597586,
        "version": 1,
        "adProofsRoot": "feb01c6b9ae7abd1e2477a57608fba47e0b603fdf5e6198ec21dee079821caec",
        "stateRoot": "bea5ee03a073076e0ac72bcdf32f0c58632b9fbb15784baca4325636a3babfe014",
        "transactionsRoot": "a51eb79a5e0974ad7eeed3c71c77dd6dd03491a64fa9580ddb68a7bdb8da80a5",
        "nBits": 108309041,
        "extensionHash": "e218d2c938d03a1a303fcff14543f066cfc40e2d02e0e425ff14082f248d84e0",
        "powSolutions": {
            "pk": "03c29d66dee9549618d1eb49460211ef1b1034bae9fb870a523cbedbfb721db18b",
            "w": "02562706e07bcbe421b4cc004f3efed5ba2ab2e65b89bfd5553099a069a9226552",
            "n": "00196be4012fc26f",
            "d": 616874694223017179690764009630362472282948848357736508023796372
        },
        "height": 123405,
        "difficulty": 128274315345920,
        "parentId": "4381721740076486858f3bc1431b27d1cbaea78c3f835163b47e5867eaed81c3",
        "votes": "000000",
        "size": 281,
        "extensionId": "edb8d2352ff35db480d85b2b23728fcf7ec5fce16eef814c21b75d84f82a0e4d",
        "transactionsId": "42df77c39611da468a2a7ad2ec1274cb36f400c642900c16c17af6b8dd45d4fa",
        "adProofsId": "b060ab9cf7036a4b21d01f4e85013e47fa35bbb1be5aa6e5f16e7687846b01ad"
    },
    {
        "id": "06e5c74ebe8e154717b1e6ebc5b5ec9de5540f48acc9f65f995f79f423932b35",
        "timestamp": 1576787610138,
        "version": 1,
        "adProofsRoot": "1ac6d3fce9d51a5f37719e65657af66731bc0496f213777b38f8b2c553637c82",
        "stateRoot": "42d6bf85e1741e05ffa069fb71ad5cd86d076a5eb9fc2f8eb3491b911b69b13d14",
        "transactionsRoot": "bcba7b6411d99a5e5dde3ec99d2d6fe68b8f9b23be26bc51aca13062355f6140",
        "nBits": 108309041,
        "extensionHash": "e218d2c938d03a1a303fcff14543f066cfc40e2d02e0e425ff14082f248d84e0",
        "powSolutions": {
            "pk": "037d9116267f8541bfec7376f5af4a99cbee8a4a0761685039e2ad0fd85c9c001b",
            "w": "024d9a62b8d07f0a279d0e05ce3128d729b9b992f8c8919eb74f2b9f91c27a7ef6",
            "n": "0017e9fb02977892",
            "d": 12249250132392732232803670677709149272558824604915256112633100
        },
        "height": 123406,
        "difficulty": 128274315345920,
        "parentId": "57d1b3af4e969cf2a3ed86eb33aca6b03cd40d1dafa656d5364b60ba62d7fbc5",
        "votes": "000000",
        "size": 280,
        "extensionId": "a9cdd9de880e43a82e5254e745b87e3833b1d318d66a7c411f1db6e53f9c8e4a",
        "transactionsId": "48dacb2f41840d90cf4804ed82f4c84994de913ddf1d1cd66b72de4cd8197e10",
        "adProofsId": "b76169d75ef0083eab65ab66b47db74a7d8646be4940331148eaf3168653d510"
    },
    {
        "id": "47bfb8c8e98923aef790364eed08c23d2c61475ef13ecf65f5241cfafebf2f52",
        "timestamp": 1576787616472,
        "version": 1,
        "adProofsRoot": "1c549c7cea750bc5b5055b1918791e88860bfaff6b9f5260dd775301ab4418cc",
        "stateRoot": "5e7ed0f28ca3c0d2118df23dd34db70ed56bbf79403386b8756c4400e39959f314",
        "transactionsRoot": "d91748228ef36f25ca178b6853457bdc874f2fc408fc4ee8f16bb377d8b9f054",
        "nBits": 108309041,
        "extensionHash": "ceb4064e9e7c1c279ebed80692026ba0ca9dacb5f4fe033008c4f887bdf99ec5",
        "powSolutions": {
            "pk": "026352d00ff542b27c6c840819bfa3ce20475584044e972b8547458383ce62759c",
            "w": "0393935d9356b41b68c91814d2318807ec0f18fe7a7d8a6e10450772ceb0c64ef2",
            "n": "00196ac800110764",
            "d": 759323199313205919997463350135768652394296000144643214633658265
        },
        "height": 123407,
        "difficulty": 128274315345920,
        "parentId": "06e5c74ebe8e154717b1e6ebc5b5ec9de5540f48acc9f65f995f79f423932b35",
        "votes": "000000",
        "size": 281,
        "extensionId": "93e9bd5bff1ae8c293d554e168b6c660c3d92eea5090d9e9c40d861dc4519792",
        "transactionsId": "3fbd8496ab5c5f3fef940ad5fdf622cb8d6a39ba475f449a35e79f4d943974b9",
        "adProofsId": "f26ff31d3d750587920b6ac10b2612e8422d836e9d975f059a7dcb1e59887513"
    },
    {
        "id": "38d32e6b3b992af85dbfd043e5320733bce903cbd4a3bf1e8b30bdec39041903",
        "timestamp": 1576787727362,
        "version": 1,
        "adProofsRoot": "f84f8b16dceab3e53e5b792f48b76d56d59cd1d0e91733f2209af1d3493775d0",
        "stateRoot": "b328f85c0e3e5c9fa177a0e476293cc5399e57db7f4b69774efec5a497fb3a6914",
        "transactionsRoot": "1553c774ba7280fc837e3d98291382c7929f846f65cd8d45f296e264044d86c1",
        "nBits": 108309041,
        "extensionHash": "ceb4064e9e7c1c279ebed80692026ba0ca9dacb5f4fe033008c4f887bdf99ec5",
        "powSolutions": {
            "pk": "02e6beaa3ba2b5bc1df8594446534b324503ca40af618f4bf7a597de74b5de8cb3",
            "w": "0309f97c89322af227657379ba7dd8c0792e1a135da2974aaa3d7a30e9045dacc6",
            "n": "0017ebc700a8e841",
            "d": 529802822502518617289307207415292846641837671794073105945681614
        },
        "height": 123408,
        "difficulty": 128274315345920,
        "parentId": "47bfb8c8e98923aef790364eed08c23d2c61475ef13ecf65f5241cfafebf2f52",
        "votes": "000000",
        "size": 281,
        "extensionId": "b2ef82d3016b1ece1a08ce8b02fe112e80aa7b3abd72f5c21381d18f493eaa3a",
        "transactionsId": "defb2b8b8e3b5f795ab46ed831b6ef0ee3b0c4b15d76caadfb39855a7dcc6522",
        "adProofsId": "eefed6f41090c3ce51b9830f92fa1d9c3c22978f198643cda0e1fa7a5e5a7819"
    },
    {
        "id": "6edef68640a95b3661c3728ed108ee1a68d683e564151e0fce8d5c477a0d9bb0",
        "timestamp": 1576787967533,
        "version": 1,
        "adProofsRoot": "b874d0ef32b0e943365783be4e9e68ccca1f378b344df06b3e04e58b41be4d47",
        "stateRoot": "799f5017d7e14f8562852b00e031180c70007b21d3c6b98d0916d515c4dd97d114",
        "transactionsRoot": "ab8a42f4e0829a4dd06806a128be80be4fedadfebed9073fb8527706e4f0e426",
        "nBits": 108309041,
        "extensionHash": "ceb4064e9e7c1c279ebed80692026ba0ca9dacb5f4fe033008c4f887bdf99ec5",
        "powSolutions": {
            "pk": "03f7ee96df40d8df46a2107cce276b1d2d66924ee83f89f93c226c66d61a114854",
            "w": "02f2185103808eb3b84a25594bdcf69b4c07751bcbf18acc5ce57132f41f966df6",
            "n": "0017eede023cb66c",
            "d": 119715053208836951379625045007368405393746288616654011146543129
        },
        "height": 123409,
        "difficulty": 128274315345920,
        "parentId": "38d32e6b3b992af85dbfd043e5320733bce903cbd4a3bf1e8b30bdec39041903",
        "votes": "000000",
        "size": 280,
        "extensionId": "826ac7f6364ea41d7bd1cd4a1586a796b7acf88dcb42153e48493e1102923b4f",
        "transactionsId": "24b541b738a0fe2cbf1e020292861bda10ee706872a28d22f9a9325361fa8eb0",
        "adProofsId": "ab3b59d072a867a283e19544cec51d5bbcfd592182cdf806cc9dc27783ed82fe"
    },
    {
        "id": "3e2ce29ced5aa9f0c10e47a2a752f6784e02976e427eb9f171f557edc68f73f4",
        "timestamp": 1576788199400,
        "version": 1,
        "adProofsRoot": "db2ef84182817e4407fa34aec0cbd82428c99159d672ad3f72a6369e77c81375",
        "stateRoot": "632b3c2d39c521db55411dba61e5309d3c398e083e8087232658c70c12e03fc714",
        "transactionsRoot": "73555d8a6e3fef0f8509548d92ad664f7543e2f8091d35b11964911bb5e18b7a",
        "nBits": 108309041,
        "extensionHash": "ff8707b481f0c409ef6bd8032b592fde6a8dc2685e8887568485d7a1de1b4311",
        "powSolutions": {
            "pk": "02894a1806166e4518cc82042605a5774edd4cf521004b28a02d928981bb3250f6",
            "w": "02af603f50bd0c1e22cd147db5c0cf8f954bed96e4e855caf1768bd26f97b4ead9",
            "n": "0018cfc503badf48",
            "d": 781558564215236691224132925929214921397331611449408367035440118
        },
        "height": 123410,
        "difficulty": 128274315345920,
        "parentId": "6edef68640a95b3661c3728ed108ee1a68d683e564151e0fce8d5c477a0d9bb0",
        "votes": "000000",
        "size": 281,
        "extensionId": "80cd9b61c092ea11f53792fe5a7586b201ed2bb97f5fff3f4e3baa994a79241c",
        "transactionsId": "c9876f3b2e977c35c5d7807c221cf54512b0cd4126be86fa0122de7ea374566b",
        "adProofsId": "3858834aeee4ad03baffdfa9951df24419e4586c66ac65e8c487b334e205a58b"
    },
    {
        "id": "d3faf9c669d43a5ee7503ea7f1ffe3584549830893b1bf7efabba98525f914db",
        "timestamp": 1576788482225,
        "version": 1,
        "adProofsRoot": "96afda4ae45e4d99908ad4f4fd5f2aa0bcfe8d1b0b359e4be20f8f50e895db85",
        "stateRoot": "15e4190dede4d7a0389f4f62c62a3e5a886ca092ed4f2715f4cf88bd9cf503ae14",
        "transactionsRoot": "c7a2d5099b6e98e83064f59aa4b7da86da5d5b70bfaad01b62d45618348d027a",
        "nBits": 108309041,
        "extensionHash": "ff8707b481f0c409ef6bd8032b592fde6a8dc2685e8887568485d7a1de1b4311",
        "powSolutions": {
            "pk": "03cc51235f08da2c45d8124bcaa065630326d80d236b8b3d19c8493aba1410cf05",
            "w": "02f3654fa929403f3b4bce3f197f5d9859b5ad90e36321f796ee87bcc07e63a9bd",
            "n": "00001df7038711f2",
            "d": 837670224394260869848105947076576265927782468494678752756966687
        },
        "height": 123411,
        "difficulty": 128274315345920,
        "parentId": "3e2ce29ced5aa9f0c10e47a2a752f6784e02976e427eb9f171f557edc68f73f4",
        "votes": "000000",
        "size": 281,
        "extensionId": "3b2503db3bf1fbba8646757d4bc25a4bff27db01d8ed9acf83992c29d7038a93",
        "transactionsId": "8d5d68da503a94622432ff5bd93f0e642843cc4bf6e283e9fd79b795c051bfbc",
        "adProofsId": "90835c34cae0475a512fb485cb19194652a811d42816ca6dfe75d38d444f98f6"
    },
    {
        "id": "e0de749a896c0170e3dad14b0f2b4119aab19c2f4639a929ba7812c4f1f77f77",
        "timestamp": 1576788534240,
        "version": 1,
        "adProofsRoot": "1157e7ff2377ddf684ef48ddfa318e5986057d16c12400a596167b5e2a7cdc8a",
        "stateRoot": "78acd902220193c2bdf62737ba1664ef72c5c7f0b61231c0b50c23dbd5876f5314",
        "transactionsRoot": "048f5ea69d8bded9829ed42df07667eacc5ea879c633b8edd4004508ebd80701",
        "nBits": 108309041,
        "extensionHash": "ff8707b481f0c409ef6bd8032b592fde6a8dc2685e8887568485d7a1de1b4311",
        "powSolutions": {
            "pk": "0213f7f50119b635cde94adc797ce99bc2698c421ab3f74a5e6077a7d3a5d9e386",
            "w": "0254183066d2eac57f27b1ba940002278732d1a48610c66735fbe803159e83ecd8",
            "n": "001943ee00293ed7",
            "d": 868223364824661210489397316912371799220417013375955106566666841
        },
        "height": 123412,
        "difficulty": 128274315345920,
        "parentId": "d3faf9c669d43a5ee7503ea7f1ffe3584549830893b1bf7efabba98525f914db",
        "votes": "000000",
        "size": 281,
        "extensionId": "1cbb10eb91c0a3adfd133d3b1cceaa464e1344e670d70229890d9c19752421ee",
        "transactionsId": "1b83abf47657d5e2b381ccf23f76ba361aedc0e2ae9a1b388c34cb02936da3a4",
        "adProofsId": "21c3da8dd694aae7ab979aae994ae7218c3400b0fb3442ab64c6c49f972a9222"
    },
    {
        "id": "0895a4a3dddbfd8faee6d9f957c42b64ee328714221809ad20d8fa4d036e1bf9",
        "timestamp": 1576788778408,
        "version": 1,
        "adProofsRoot": "854ff2e9688470c5a6586688a1c9fe3bfa548f791f51f1017cfa7f60caea8a2a",
        "stateRoot": "9cb3f3054d0a2d7e88b3f2dba5c3e3588259da99b0432d7275b61a873ea3143e14",
        "transactionsRoot": "986f6da6ca160e5d9df454c16c1d4d8e70d461ea8768b5f213fb1951451179b7",
        "nBits": 108309041,
        "extensionHash": "ff8707b481f0c409ef6bd8032b592fde6a8dc2685e8887568485d7a1de1b4311",
        "powSolutions": {
            "pk": "02a2ac3698e77e6a9fc5872bb56dad50de9a27594b12fd0dea0559ce43d3a6c08b",
            "w": "03a28f786076906404fdc268410665e67df07305bd8a1d08e961cc6025f6e43897",
            "n": "0019f9cf02dd166f",
            "d": 879995400658947226090967819482925381908353602360798422310149941
        },
        "height": 123413,
        "difficulty": 128274315345920,
        "parentId": "e0de749a896c0170e3dad14b0f2b4119aab19c2f4639a929ba7812c4f1f77f77",
        "votes": "000000",
        "size": 281,
        "extensionId": "e102465ebf751dfdb4e3547910d541d8b70db7cacca986ee928547e65f954079",
        "transactionsId": "b7e93054a1363042fdb9e36a63357fb74855d16891ff4006503eb874c7f728ac",
        "adProofsId": "a18539ed956b953bd36f12afff207a0fb7abd38bb8cfaa17f1401519c3813c1e"
    },
    {
        "id": "8d87fd4a7372877462ff7ecb52a6063207ffda2689f4de3254cc9a2877953f4f",
        "timestamp": 1576789077841,
        "version": 1,
        "adProofsRoot": "639b35e46f28aba7976719186788e3553b315a09bb9e9699b03f8f11b76aa498",
        "stateRoot": "25ff1da6e5bf14304196c19461a4bd24f8ce6c493153baea3c3d6efe17d4bda814",
        "transactionsRoot": "39dd1b70b5990ffcd65833f77bcdfa24577162c8bf40328626c2aa2038c60f15",
        "nBits": 108309041,
        "extensionHash": "ff8707b481f0c409ef6bd8032b592fde6a8dc2685e8887568485d7a1de1b4311",
        "powSolutions": {
            "pk": "03d7b37fcacec8759f6321053b3dcf5c468ea5bcfd4adb2dce5ceeeaeeb28eca60",
            "w": "02821250d4fdeb2e0d917a3c7037702d901979a859c3311ea22029bf781f016e7b",
            "n": "0019d9f40276e5a9",
            "d": 177836710894285496567430851674379430857637034510197170731469383
        },
        "height": 123414,
        "difficulty": 128274315345920,
        "parentId": "0895a4a3dddbfd8faee6d9f957c42b64ee328714221809ad20d8fa4d036e1bf9",
        "votes": "000000",
        "size": 279,
        "extensionId": "3a32c875d052885fceb9ff852a707d2bab3aec2a79c58b503b3fbb21cb5bbd6c",
        "transactionsId": "1a652eca9a03aa6c5de86d3919bc9189c373771fd433da53ab9c4ea19bccc2f2",
        "adProofsId": "e0f85adbe5de06dd15cce477291ffc22b6b734d004b17d6682e8f9feefe28424"
    }
]
const blockHeaders = BlockHeaders.from_json(contextData)
const pre_header = PreHeader.from_block_header(blockHeaders.get(blockHeaders.len() - 1))
const defaultCtx = new ErgoStateContext(pre_header, blockHeaders);

export default defaultCtx
