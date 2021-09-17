/**
 * @namespace parser
 * @memberof module:kdljs
 * @borrows module:kdljs.parser.kdl.parse as parse
 */

const kdl = require('./kdl')

module.exports.parse = kdl.parse
module.exports.kdl = kdl
