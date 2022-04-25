/* eslint-env mocha */

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const suite = require('./suite.json')
const { parse, format } = require('../')

function getInput (name) {
  const fileName = path.join(__dirname, './kdl', name + '.kdl')
  return fs.readFileSync(fileName, 'utf8')
}

function prepareExpectations (output) {
  return output.map(node => ({
    name: 'node',
    values: [],
    properties: {},
    children: [],
    ...node,
    tags: {
      name: undefined,
      values: [],
      properties: {},
      ...(node.tags || {})
    }
  }))
}

describe('parses', function () {
  for (const thing in suite) {
    const input = getInput(thing)
    it(thing, function () {
      const actual = parse(input)

      if (actual.errors.length) {
        throw actual.errors[0]
      }

      const expected = prepareExpectations(suite[thing])
      assert.deepStrictEqual(actual.output, expected)
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
