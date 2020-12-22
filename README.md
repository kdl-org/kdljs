# KDL-JS

A JavaScript library for the [KDL Document Language](https://github.com/kdl-org/kdl).

## Install

    npm install kdljs

## Usage

Right now, only parsing is supported:

```js
const parseKdl = require('kdljs')
parseKdl(`// Nodes can be separated into multiple lines
title \
  "Some title"


// Files must be utf8 encoded!
smile "😁"

// Instead of anonymous nodes, nodes and properties can be wrapped
// in "" for arbitrary node names.
"!@#$@$%Q#$%~@!40" "1.2.3" "!!!!!"=true

// The following is a legal bare identifier:
foo123~!@#$%^&*.:'|/?+ "weeee"

// And you can also use unicode!
ノード　お名前＝"☜(ﾟヮﾟ☜)"

// kdl specifically allows properties and values to be
// interspersed with each other, much like CLI commands.
foo bar=true "baz" quux=false 1 2 3
`)

[
  {
    name: 'title',
    properties: {},
    values: [ 'Some title' ],
    children: []
  },
  { name: 'smile', properties: {}, values: [ '😁' ], children: [] },
  {
    name: '!@#$@$%Q#$%~@!40',
    properties: { '!!!!!': true },
    values: [ '1.2.3' ],
    children: []
  },
  {
    name: "foo123~!@#$%^&*.:'|/?+",
    properties: {},
    values: [ 'weeee' ],
    children: []
  },
  {
    name: 'ノード　お名前＝"☜(ﾟヮﾟ☜)"',
    properties: {},
    values: [],
    children: []
  },
  {
    name: 'foo',
    properties: { bar: true, quux: false },
    values: [ 'baz', 1, 2, 3 ],
    children: []
  }
]
```

## License

The code is available under the [MIT license](LICENSE). The example above is
made available from https://github.com/kdl-org/kdl under
[Creative Commons Attribution-ShareAlike 4.0 International](https://github.com/kdl-org/kdl/blob/main/LICENSE.md).
