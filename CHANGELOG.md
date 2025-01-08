# [0.3.0](https://github.com/kdl-org/kdljs/compare/v0.2.0...v0.3.0) (2025-01-08)


### Bug Fixes

* **formatter:** update to KDL 2.0 ([e2b73c5](https://github.com/kdl-org/kdljs/commit/e2b73c5d733b3aa5acb6be64d7145d45cdd10af0))
* **parser:** add vertical tab (0x0B) as newline ([cdccd9f](https://github.com/kdl-org/kdljs/commit/cdccd9faf18e8f9d2c98d926c3b597338ef2f91b))
* **parser:** add whitespace escapes to quoted strings ([d04352c](https://github.com/kdl-org/kdljs/commit/d04352c67586fb8122c56969c368923e35d1488c))
* **parser:** allow bare identifier strings ([d531b07](https://github.com/kdl-org/kdljs/commit/d531b07eb52f8a7d9f4f9ae738be260ccd54c1c8))
* **parser:** disallow banned identifier values ([a867a74](https://github.com/kdl-org/kdljs/commit/a867a746256343ccdbfbfe781f736d2a090a6581))
* **parser:** disallow escaped unicode scalar values ([401e612](https://github.com/kdl-org/kdljs/commit/401e612c87c841e1667a08ee181fd52def145b00))
* **parser:** disallow more literal code points ([c099947](https://github.com/kdl-org/kdljs/commit/c099947a9dee329aa5c465c9fb0b66a43adc9573))
* **parser:** disallow more numeric-like bare identifiers ([8ba3e15](https://github.com/kdl-org/kdljs/commit/8ba3e1542cca8ee78fef5cac92a9d6bf1d7bcdd8))
* **parser:** disallow some literal code points ([5256331](https://github.com/kdl-org/kdljs/commit/5256331883371a4ba4d973cfd2dc1e8d8debe385))
* **parser:** fix disallowed code point regexes ([2cf1c39](https://github.com/kdl-org/kdljs/commit/2cf1c3939b8358625885cca6fbb702abbcea2c98))
* **parser:** fix escline behavior ([89e0585](https://github.com/kdl-org/kdljs/commit/89e0585f6842f13e5dbd9a23580ee9fefea91b59))
* **parser:** fix handling of surrogate pairs ([e191c69](https://github.com/kdl-org/kdljs/commit/e191c695a5097bdbe17db6224fb092b1dcdd1910))
* **parser:** fix parsing of multiline strings ([fcddb84](https://github.com/kdl-org/kdljs/commit/fcddb8461002002c927782f26ae4dd96ed3efe30))
* **parser:** fix slashdash behavior ([f033654](https://github.com/kdl-org/kdljs/commit/f0336548f3879bb3203d3e547a9e92af771faa45))
* **parser:** fix slashdash behavior ([622fbd8](https://github.com/kdl-org/kdljs/commit/622fbd8802b3fb628a7d47aa3efc2be2c0ffc0be))
* **parser:** fix unterminated nodes at the end of children blocks ([48b4307](https://github.com/kdl-org/kdljs/commit/48b430789ccdddff0b3eb425d6950e7de11d7eec))
* **parser:** implement bare identifier strings ([846f7c0](https://github.com/kdl-org/kdljs/commit/846f7c0cfea8c2bc82d22ed59b314dbc1d6137d0))
* **parser:** implement float keywords ([7250cd1](https://github.com/kdl-org/kdljs/commit/7250cd130823d171bc5788f0cd63e81cec4486e7))
* **parser:** implement multiline strings ([127f9a2](https://github.com/kdl-org/kdljs/commit/127f9a20a48ec6de927c450aae857225a1688f37))
* **parser:** only allow U+FEFF at start of file ([e1e3769](https://github.com/kdl-org/kdljs/commit/e1e37691961757e9b8553388eb663c73d9e1d83f))
* **parser:** remove '#' as identifier character ([c632bd1](https://github.com/kdl-org/kdljs/commit/c632bd15ede0d7578f0081c7d0d2513a3ad71eb2))
* **parser:** remove raw string prefix ([a4ffec2](https://github.com/kdl-org/kdljs/commit/a4ffec2c8528e42198f427f58d3a8091e2b54ab1))
* **parser:** un-reserve ",", "<", and ">" from identifier strings ([375d8b8](https://github.com/kdl-org/kdljs/commit/375d8b834ca9fff31df47d17f78ce54a36679f5e))
* **parser:** update boolean/null literals ([a0ccaee](https://github.com/kdl-org/kdljs/commit/a0ccaee98f77fb93a156bed3901077421ccab587))
* **parser:** update escaped characters for quoted strings ([89eb557](https://github.com/kdl-org/kdljs/commit/89eb5576e328a3ee1bdcee6793464fd734f0c975))
* **parser:** update optional whitespace limitations ([7d12d1d](https://github.com/kdl-org/kdljs/commit/7d12d1d07528fa3f85997729337d39053f4a5d0c))
* **query:** update KQL to 2.0 ([719f966](https://github.com/kdl-org/kdljs/commit/719f96682ace97a3b3570daaa690e5611cc78029))
* **types:** update to KDL 2.0 ([3712172](https://github.com/kdl-org/kdljs/commit/3712172731a87dd4646afd6e1f0c99eeb30d13cf))


### chore

* bump development dependencies ([f07cc25](https://github.com/kdl-org/kdljs/commit/f07cc25bd35218bdd7194b0be6e19f5a07c4815d))


### Code Refactoring

* change to ESM ([974b2b2](https://github.com/kdl-org/kdljs/commit/974b2b25a7c22ebdd3647c923c596a6e039274f1))


### BREAKING CHANGES

* This library is now ESM-only.
* Drop support for Node.js v16



# [0.2.0](https://github.com/kdl-org/kdljs/compare/v0.1.5...v0.2.0) (2023-10-16)


### Bug Fixes

* **types:** remove kdljs typescript namespace ([eb85a26](https://github.com/kdl-org/kdljs/commit/eb85a2632c421a40f1c25dd27017f6beac708f24)), closes [#19](https://github.com/kdl-org/kdljs/issues/19)


### BREAKING CHANGES

* **types:** for typescript users.



## [0.1.5](https://github.com/kdl-org/kdljs/compare/v0.1.4...v0.1.5) (2022-09-26)


### Bug Fixes

* **parser:** align type annotations with values ([a6c8694](https://github.com/kdl-org/kdljs/commit/a6c8694950e30dbff1bc14496f2803546693a47e))
* **validator:** validate node type annotations ([1cb05ad](https://github.com/kdl-org/kdljs/commit/1cb05ad2920e0165d99ce35bb697dc75d286cd07))



## [0.1.4](https://github.com/kdl-org/kdljs/compare/v0.1.3...v0.1.4) (2022-04-25)


### Features

* **queryEngine:** support tags ([832ccb4](https://github.com/kdl-org/kdljs/commit/832ccb4556e65c1b16598ef25aaad09aeb05a081))



## [0.1.3](https://github.com/kdl-org/kdljs/compare/v0.1.2...v0.1.3) (2022-04-25)


### Bug Fixes

* **formatter:** fix node tag escapes ([7ab1bef](https://github.com/kdl-org/kdljs/commit/7ab1bef99bee4a46ffaafa20520d0bf1eab5d416))
* **parser:** fix 6e59505 ([93856e5](https://github.com/kdl-org/kdljs/commit/93856e5a492026607f982ed915ba0c0729bb9f44))
* **parser:** force to parse until EOF ([6e59505](https://github.com/kdl-org/kdljs/commit/6e595058455964ed05b7461be1f05713c6e352c7))
* **parser:** handle boolean/null prefix in identifier ([a274ade](https://github.com/kdl-org/kdljs/commit/a274ade96700ab42571b9c6532b0aba86c89a1cc)), closes [#12](https://github.com/kdl-org/kdljs/issues/12)
* **parser:** handle lexer errors ([ec672d4](https://github.com/kdl-org/kdljs/commit/ec672d49f4cde017339bf5bffc2205f675aff05c)), closes [#11](https://github.com/kdl-org/kdljs/issues/11) [#10](https://github.com/kdl-org/kdljs/issues/10)
* **parser:** limit unicode escapes ([1981017](https://github.com/kdl-org/kdljs/commit/19810172052fe17535a4d23f300d461e7a054797)), closes [#10](https://github.com/kdl-org/kdljs/issues/10)


### Features

* fully support type annotations ([63a008f](https://github.com/kdl-org/kdljs/commit/63a008f06b3890fe473448e987de0037ccde8f18))



## [0.1.2](https://github.com/kdl-org/kdljs/compare/v0.1.1...v0.1.2) (2022-04-23)


### Bug Fixes

* fix require stack ([c94f5c8](https://github.com/kdl-org/kdljs/commit/c94f5c8b648f8e2971d1c54b532abb9c32bef0a5))
* **parser:** correct BOM from U+FFEF to U+FEFF ([f07927e](https://github.com/kdl-org/kdljs/commit/f07927ee5b969ed02b02e76fc3c732400be2b2aa))


### Features

* **queryEngine:** support queries ([ec79f78](https://github.com/kdl-org/kdljs/commit/ec79f789211df5d25e87b15671c390baae6e928a))



## [0.1.1](https://github.com/kdl-org/kdljs/compare/v0.1.0...v0.1.1) (2021-09-16)


### Bug Fixes

* **formatter:** fix bare idents in output ([09a6ba6](https://github.com/kdl-org/kdljs/commit/09a6ba6a3019b0a3ae77771c40eba363ffa6d9db))



# [0.1.0](https://github.com/kdl-org/kdljs/compare/v0.1.0-rc.2...v0.1.0) (2021-09-16)


### Bug Fixes

* **parser:** allow line comment as node terminator ([fb8d9e1](https://github.com/kdl-org/kdljs/commit/fb8d9e199da5ed04da86f9e75ae5a058909aa75d))
* **parser:** do not include non ident chars in idents ([#8](https://github.com/kdl-org/kdljs/issues/8)) ([e5e38ef](https://github.com/kdl-org/kdljs/commit/e5e38ef3ca0ecde7be007cae6bbe39f623fa0adf))
* **parser:** treat standalone carriage return as newline ([#7](https://github.com/kdl-org/kdljs/issues/7)) ([6f00292](https://github.com/kdl-org/kdljs/commit/6f00292fe30a55411372efb0aea05d9512296576))



# [0.1.0-rc.2](https://github.com/kdl-org/kdljs/compare/v0.1.0-rc.1...v0.1.0-rc.2) (2021-09-11)


### Bug Fixes

* **formatter:** remove debug statement ([95fd47f](https://github.com/kdl-org/kdljs/commit/95fd47fe8d3312e5ff415ba525b45a8056b9eb23))
* **parser:** allow _ in decimal parts of numbers ([541ab30](https://github.com/kdl-org/kdljs/commit/541ab303d43dd949447009857e8b29f9022ff1fe))
* **parser:** allow escaped forward slash ([159d9ba](https://github.com/kdl-org/kdljs/commit/159d9ba09df44e11927a6c7a51a6a5a5e2b10972))
* **parser:** allow line comment at EOF ([1c72d65](https://github.com/kdl-org/kdljs/commit/1c72d65cb7e2647475fe0fbd95b8543922ebdd98))
* **parser:** allow signed non-decimal integers ([2f0ab9b](https://github.com/kdl-org/kdljs/commit/2f0ab9beb8998df9ff97b58a040c6b8f9357b248))
* **parser:** fix node-space and whitespace ([54ccc28](https://github.com/kdl-org/kdljs/commit/54ccc28e09ef0d9fdfc757062581691f0a479925))
* **parser:** require one hex character in \u{} ([0d6304b](https://github.com/kdl-org/kdljs/commit/0d6304ba2bfe078d47bafa615bfa992249d1a4b1))


### Features

* **parser:** support (type) annotation ([54dbb53](https://github.com/kdl-org/kdljs/commit/54dbb537caa6c9517dfa298f12e29defec65f832))



# [0.1.0-rc.1](https://github.com/kdl-org/kdljs/compare/v0.1.0-rc.0...v0.1.0-rc.1) (2021-09-03)


### Bug Fixes

* **parser:** fix multiline comments behavior ([48c2bba](https://github.com/kdl-org/kdljs/commit/48c2bbaf0d18b2ff7c2bacf141b482ca4deba056))


### Features

* **validator:** extract document validator ([9ec20f9](https://github.com/kdl-org/kdljs/commit/9ec20f9c4b19cac7e1a5672c43e2a959dff2bdaa))



# [0.1.0-rc.0](https://github.com/kdl-org/kdljs/compare/v0.0.3...v0.1.0-rc.0) (2021-08-31)


* feat(formatter)!: support KDL serialization ([4c4c94e](https://github.com/kdl-org/kdljs/commit/4c4c94edb14c2867f539288033f0edca97a15410))


### Bug Fixes

* **parser:** allow raw strings as identifiers ([8cea257](https://github.com/kdl-org/kdljs/commit/8cea257261caaf9313303b2f2b1bf0e166ece08b))
* **parser:** allow true, false, null as identifiers ([3813139](https://github.com/kdl-org/kdljs/commit/38131394c046d298cd4e9e8bbead76bb8242b616))
* **parser:** fix edge cases in node-space behavior ([441c967](https://github.com/kdl-org/kdljs/commit/441c9674ddf4acce7d5378d07ec1e0022e2c5805))
* **parser:** parse nodes with only node-space ([de00d21](https://github.com/kdl-org/kdljs/commit/de00d215cc04fe43ec98c0492b8a1e89da847e77))
* **ts:** update types ([3049abe](https://github.com/kdl-org/kdljs/commit/3049abe46343cea4f2c091ef9426573d75771668))


### Features

* **formatter:** support same output options as kdl4j ([d37df28](https://github.com/kdl-org/kdljs/commit/d37df287cf99a9628e37a14f8e6c35cb7cac5632))
* **ts:** update ts types for output formatting ([c3dd78d](https://github.com/kdl-org/kdljs/commit/c3dd78db40dce7aa60a06c07e8e2b131fdba932b))


### BREAKING CHANGES

* module exports is no longer the
function 'parse', but an object with two entries:
'parse', and 'format'.



## [0.0.3](https://github.com/kdl-org/kdljs/compare/v0.0.2...v0.0.3) (2021-02-24)


### Bug Fixes

* allow number separators ('_') in decimals ([412a36b](https://github.com/kdl-org/kdljs/commit/412a36b987c24f7a940487c646a886f822954f9e))
* change radix-16 prefix to 'x' ([1650427](https://github.com/kdl-org/kdljs/commit/16504270ab509c03c46416b1cc64cb478bae40e7))
* parse integer before float ([15f2d6d](https://github.com/kdl-org/kdljs/commit/15f2d6dd98e5c3fd52b3056ee253c09d097122fb))
* **parser:** ignore leading zero in base-10 ints ([c4dc96e](https://github.com/kdl-org/kdljs/commit/c4dc96e7f6de68d33851ec340afb34af8f8e2b1f))


### Features

* **ts:** add types ([95ecabe](https://github.com/kdl-org/kdljs/commit/95ecabeab994f68a65fe6e4bce9c8378d7fce7ad))



## [0.0.2](https://github.com/kdl-org/kdljs/compare/v0.0.1...v0.0.2) (2020-12-22)



## [0.0.1](https://github.com/kdl-org/kdljs/compare/40c0bdb55d07c8decfd6e873bee7262e25bc28f0...v0.0.1) (2020-12-22)


### Bug Fixes

* add entry point ([bb1f2d5](https://github.com/kdl-org/kdljs/commit/bb1f2d5a095e6f59d1f9de4c61d04ff6e1dfe060))


### Features

* **parser:** implement chevrotain parser ([40c0bdb](https://github.com/kdl-org/kdljs/commit/40c0bdb55d07c8decfd6e873bee7262e25bc28f0))



