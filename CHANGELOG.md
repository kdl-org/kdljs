# [0.1.0-rc.1](https://github.com/kdl-org/kdljs/compare/v0.1.0-rc.0...v0.1.0-rc.1) (2021-09-03)


### Bug Fixes

* **parser:** fix multiline comments behavior ([48c2bba](https://github.com/kdl-org/kdljs/commit/48c2bbaf0d18b2ff7c2bacf141b482ca4deba056))


### Features

* **validator:** extract document validator ([9ec20f9](https://github.com/kdl-org/kdljs/commit/9ec20f9c4b19cac7e1a5672c43e2a959dff2bdaa))



# [0.1.0-rc.0](https://github.com/kdl-org/kdljs/compare/v0.0.3...v0.1.0-rc.0) (2021-08-31)


### Bug Fixes

* **parser:** allow raw strings as identifiers ([8cea257](https://github.com/kdl-org/kdljs/commit/8cea257261caaf9313303b2f2b1bf0e166ece08b))
* **parser:** allow true, false, null as identifiers ([3813139](https://github.com/kdl-org/kdljs/commit/38131394c046d298cd4e9e8bbead76bb8242b616))
* **parser:** fix edge cases in node-space behavior ([441c967](https://github.com/kdl-org/kdljs/commit/441c9674ddf4acce7d5378d07ec1e0022e2c5805))
* **parser:** parse nodes with only node-space ([de00d21](https://github.com/kdl-org/kdljs/commit/de00d215cc04fe43ec98c0492b8a1e89da847e77))
* **ts:** update types ([3049abe](https://github.com/kdl-org/kdljs/commit/3049abe46343cea4f2c091ef9426573d75771668))


* feat(formatter)!: support KDL serialization ([4c4c94e](https://github.com/kdl-org/kdljs/commit/4c4c94edb14c2867f539288033f0edca97a15410))


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



