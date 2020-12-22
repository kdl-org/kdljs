const fs = require('fs')
const { parse } = require('./parser.js')

const input = fs.readFileSync('test.kdl', 'utf8')

console.log(parse(input).output)
