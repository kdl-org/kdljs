# KDL-JS

A JavaScript library for the [KDL Document Language](https://github.com/kdl-org/kdl).

## Install

    npm install kdljs

## Usage

### Parsing

```js
const { parse } = require('kdljs')
parse(`
// Nodes can be separated into multiple lines
title \
  "Some title"
`)

// [
//   {
//     name: 'title',
//     properties: {},
//     values: [ 'Some title' ],
//     children: [],
//     tags: {
//       name: undefined,
//       properties: {},
//       values: [ undefined ]
//     }
//   }
// ]

parse(`
// Files must be utf8 encoded!
smile "😁"
`)

// [
//   {
//     name: 'smile',
//     properties: {},
//     values: [ '😁' ],
//     children: [],
//     tags: {
//       name: undefined,
//       properties: {},
//       values: [ undefined ]
//     }
//   }
// ]

parse(`
// Instead of anonymous nodes, nodes and properties can be wrapped
// in "" for arbitrary node names.
"!@#$@$%Q#$%~@!40" "1.2.3" "!!!!!"=#true
`)

// [
//   {
//     name: '!@#$@$%Q#$%~@!40',
//     properties: { '!!!!!': true },
//     values: [ '1.2.3' ],
//     children: [],
//     tags: {
//       name: undefined,
//       properties: { '!!!!!': undefined },
//       values: [ undefined ]
//     }
//   }
// ]

parse(`
// The following is a legal bare identifier:
foo123~!@$%^&*.:'|?+ "weeee"

// And you can also use unicode!
ノード お名前="☜(ﾟヮﾟ☜)"
`)

// [
//   {
//     name: "foo123~!@$%^&*.:'|?+",
//     properties: {},
//     values: [ 'weeee' ],
//     children: [],
//     tags: {
//       name: undefined,
//       properties: {},
//       values: [ undefined ]
//     }
//   },
//   {
//     name: 'ノード',
//     properties: { 'お名前': '☜(ﾟヮﾟ☜)' },
//     values: [],
//     children: [],
//     tags: {
//       name: undefined,
//       properties: {},
//       values: []
//     }
//   }
// ]

parse(`
// kdl specifically allows properties and values to be
// interspersed with each other, much like CLI commands.
foo bar=#true "baz" quux=#false 1 2 3
`)

// [
//   {
//     name: 'foo',
//     properties: { bar: true, quux: false },
//     values: [ 'baz', 1, 2, 3 ],
//     children: [],
//     tags: {
//       name: undefined,
//       properties: { bar: undefined, quux: undefined },
//       values: [ undefined, undefined, undefined, undefined ]
//     }
//   }
// ]

parse(`
// kdl also allows for annotationg values with types, and
// for denoting relations between nodes.
package {
  (author)person contact=(email)"example@example.org"
  (contributor)person homepage=(url)"https://example.org/example"
}
`)

// [
//   {
//     name: 'package',
//     properties: {},
//     values: [],
//     children: [
//       {
//         name: 'person',
//         properties: { contact: 'example@example.org' },
//         values: [],
//         children: [],
//         tags: {
//           name: 'author',
//           properties: { contact: 'email' },
//           values: []
//         }
//       },
//       {
//         name: 'person',
//         properties: { homepage: 'https://example.org/example' },
//         values: [],
//         children: [],
//         tags: {
//           name: 'contributor',
//           properties: { homepage: 'url' },
//           values: []
//         }
//       }
//     ],
//     tags: { name: undefined, properties: {}, values: [] }
//   }
// ]
```

### Querying

```js
const { parse, query } = require('kdljs')

const { output: document } = parse(`package {
    name "foo"
    version "1.0.0"
    dependencies platform="windows" {
        winapi "1.0.0" path="./crates/my-winapi-fork"
    }
    dependencies {
        miette "2.0.0" dev=#true
    }
}`)

query(document, 'package >> name') // or
query(document, 'top() > package >> name')

// [
//   {
//     name: 'name',
//     values: ['foo'],
//     ...
//   }
// ]

query(document, 'dependencies')

// [
//   {
//     name: 'dependencies',
//     properties: { platform: 'windows' },
//     ...
//   },
//   {
//     name: 'dependencies',
//     ...
//   }
// ]

query(document, 'dependencies[platform]') // or
query(document, 'dependencies[prop(platform)]')

// [
//   {
//     name: 'dependencies',
//     properties: { platform: 'windows' },
//     ...
//   }
// ]

query(document, 'dependencies > []')

// [
//   {
//     name: 'winapi',
//     properties: { path: './crates/my-winapi-fork' },
//     values: [ '1.0.0' ],
//     ...
//   },
//   {
//     name: 'miette',
//     properties: { dev: 'true' },
//     values: [ '2.0.0' ],
//     ...
//   }
// ]

// MAP OPERATOR
// ============

query(document, 'package >> name => val()')
// ['foo'].

query(document, 'dependencies[platform] => platform')
// ['windows']

query(document, 'dependencies > [] => (name(), val(), path)')
// [('winapi', '1.0.0', './crates/my-winapi-fork'), ('miette', '2.0.0', None)]

query(document, 'dependencies > [] => (name(), values(), props())')
// [('winapi', ['1.0.0'], {'platform': 'windows'}), ('miette', ['2.0.0'], {'dev': true})]
```

### Formatting

```js
const { format } = require('kdljs')

format([
  {
    name: 'title',
    properties: {},
    values: [ 'Some title' ],
    children: [],
    tags: { properties: {}, values: [] }
  },
  {
    name: 'smile',
    properties: {},
    values: [ '😁' ],
    children: [],
    tags: { properties: {}, values: [] }
  },
  {
    name: '!@#$@$%Q#$%~@!40',
    properties: { '!!!!!': true },
    values: [ '1.2.3' ],
    children: [],
    tags: { properties: {}, values: [] }
  },
  {
    name: "foo123~!@#$%^&*.:'|/?+",
    properties: {},
    values: [ 'weeee' ],
    children: [],
    tags: { properties: {}, values: [] }
  },
  {
    name: 'ノード',
    properties: { 'お名前': '☜(ﾟヮﾟ☜)' },
    values: [],
    children: [],
    tags: { properties: {}, values: [] }
  },
  {
    name: 'foo',
    properties: { bar: true, quux: false },
    values: [ 'baz', 1, 2, 3 ],
    children: [],
    tags: { properties: {}, values: [] }
  }
])

`title "Some title"
smile "😁"
"!@#$@$%Q#$%~@!40" "1.2.3" !!!!!=true
foo123~!@#$%^&*.:'|/?+ "weeee"
ノード お名前="☜(ﾟヮﾟ☜)"
foo "baz" 1 2 3 bar=true quux=false
`
```

## License

The code is available under the [MIT license](LICENSE). The example above is
made available from https://github.com/kdl-org/kdl under
[Creative Commons Attribution-ShareAlike 4.0 International](https://github.com/kdl-org/kdl/blob/main/LICENSE.md).
The submodule in `test/kdl4j` is licensed according to its `LICENSE.md` file.
