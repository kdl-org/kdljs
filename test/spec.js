/* eslint-env mocha */

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const suite = require('./suite.json')
const { parse, format } = require('../')

function prepareExpectations (nodes) {
  return nodes.map(node => ({
    name: node.name ?? 'node',
    values: node.values ?? [],
    properties: node.properties ?? {},
    children: node.children ? prepareExpectations(node.children) : [],
    tags: {
      name: node.tags?.name,
      values: node.tags?.values ?? Array(node.values ? node.values.length : 0).fill(undefined),
      properties: node.tags?.properties ?? {}
    }
  }))
}

const customTests = path.join(__dirname, './kdl')
const customTestFile = fs.readdirSync(customTests)

describe('Custom tests', function () {
  for (const test of customTestFile) {
    const name = test.slice(0, -4)
    const input = fs.readFileSync(path.join(customTests, test), 'utf8')

    describe(name, function () {
      if (name in suite) {
        it('parses', function () {
          const actual = parse(input)

          if (actual.errors.length) {
            throw actual.errors[0]
          }

          const expected = prepareExpectations(suite[name])
          assert.deepStrictEqual(actual.output, expected)
        })
      } else {
        it('fails to parse', function () {
          const actual = parse(input)
          assert.strictEqual(actual.output, undefined)
        })
      }
    })
  }
})

const KDL4J_BROKEN_OUTPUT_TESTS = new Set([
  // Different float formats
  'hex.kdl',
  'hex_int.kdl',
  'negative_exponent.kdl',
  'negative_float.kdl',
  'no_decimal_exponent.kdl',
  'numeric_prop.kdl',
  'positive_exponent.kdl',
  'prop_float_type.kdl',
  'slashdash_negative_number.kdl',
  'underscore_in_exponent.kdl',
  'underscore_in_float.kdl',
  'zero_float.kdl',

  // Different float+integer formats
  'parse_all_arg_types.kdl',

  // Limitations of JavaScript numbers
  'sci_notation_large.kdl',
  'sci_notation_small.kdl'
])

const KDL4J_OPTIONS = {
  escapes: {},
  requireSemicolons: false,
  escapeNonAscii: false,
  escapeNonPrintableAscii: true,
  escapeCommon: false,
  escapeLinespace: true,
  newline: '\n',
  indent: 4,
  indentChar: ' ',
  exponentChar: 'E',
  preferIdentifierString: true,
  printEmptyChildren: false,
  printNullArgs: true,
  printNullProps: true
}

const KDL4J_PATH = path.join(__dirname, 'kdl-official', 'tests', 'test_cases')
const KDL4J_INPUT_PATH = path.join(KDL4J_PATH, 'input')
const kdl4jInput = fs.readdirSync(KDL4J_INPUT_PATH)

describe('Official test suite', function () {
  for (const file of kdl4jInput) {
    describe(file, function () {
      const input = fs.readFileSync(path.join(KDL4J_INPUT_PATH, file), 'utf8')
      const expectedPath = path.join(KDL4J_PATH, 'expected_kdl', file)

      if (fs.existsSync(expectedPath)) {
        const expected = fs.readFileSync(expectedPath, 'utf8')

        if (KDL4J_BROKEN_OUTPUT_TESTS.has(file)) {
          it('parses', function () {
            const { output, errors } = parse(input)
            const parsedExpected = parse(expected).output
            assert.deepStrictEqual(errors, [])
            assert.deepStrictEqual(output, parsedExpected)
          })
        } else {
          it('parses and formats', function () {
            const { output, errors } = parse(input)
            assert.deepStrictEqual(errors, [])
            assert.strictEqual(format(output, KDL4J_OPTIONS), expected)
          })
        }
      } else {
        it('fails to parse', function () {
          assert.deepStrictEqual(parse(input).output, undefined)
          assert.notDeepStrictEqual(parse(input).errors, [])
        })
      }
    })
  }
})
