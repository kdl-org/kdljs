/**
 * @module kdljs
 * @borrows module:kdljs/parser~parse as parse
 * @borrows module:kdljs/formatter~format as format
 * @borrows module:kdljs/validator~validateDocument as validateDocument
 */

const { parse } = require('./parser.js')
const { format } = require('./formatter.js')
const { validateDocument } = require('./validator.js')

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#document|Document}.
 *
 * @typedef Document
 * @type {Array<module:kdljs~Node>}
 */

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#node|Node}.
 *
 * @typedef Node
 * @type {Object}
 * @property {string} name - The name of the Node
 * @property {Array<module:kdljs~Value>} values - Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#argument|Arguments}
 * @property {Object<string,module:kdljs~Value>} properties - Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#property|Properties}
 * @property {module:kdljs~Document} children - Nodes in the {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#children-block|Children block}
 */

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#value|Value}.
 *
 * @typedef Value
 * @type {(string|number|boolean|null)}
 */

module.exports.parse = parse
module.exports.format = format
module.exports.validateDocument = validateDocument
