/**
 * @module kdljs
 * @borrows module:kdljs.parser.kdl.parse as parse
 * @borrows module:kdljs.formatter.format as format
 * @borrows module:kdljs.queryEngine.query as query
 * @borrows module:kdljs.validator.validateDocument as validateDocument
 */

const { parse } = require('./parser/index.js')
const { format } = require('./formatter.js')
const { query } = require('./queryEngine.js')
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
 * @property {module:kdljs~NodeTypeAnnotations} tags - Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#type-annotation|type annotations
 */

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#value|Value}}.
 *
 * @typedef Value
 * @type {(string|number|boolean|null)}
 */

/**
 *
 * @typedef NodeTypeAnnotations
 * @type {Object}
 * @property {string} name - The type annotation of the Node
 * @property {Array<string>} values - The type annotations of the {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#argument|Arguments}
 * @property {Object<string,string>} properties - The type annotations of the {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#property|Properties}
 */

/**
 * A {@link https://github.com/kdl-org/kdl/blob/main/QUERY-SPEC.md|Query string}.
 *
 * @typedef QueryString
 * @type {string}
 */

module.exports.parse = parse
module.exports.format = format
module.exports.query = query
module.exports.validateDocument = validateDocument
