/* eslint-env mocha */

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const suite = require('./suite.json')
const { parse } = require('../')

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
    ...node
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
