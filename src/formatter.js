/**
 * @namespace formatter
 * @memberof module:kdljs
 */

const { validateDocument } = require('./validator.js')

/* eslint-disable no-control-regex */
const linespace = /^[\r\n\u0085\u000C\u2028\u2029]$/
const nonAscii = /^[^\x00-\x7F]$/
const nonPrintableAscii = /^[\x00-\x19\x7F]$/
/* eslint-enable no-control-regex */
const commonEscapes = {
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\\': '\\\\',
  '"': '\\"',
  '\x08': '\\b',
  '\x0C': '\\f'
}

const identifierPattern = /^(?![+-]?\.?\d)[\x21\x24-\x27\x2A-\x2E\x30-\x3A\x3C\x3E-\x5A\x5E-\x7A\x7C\x7E\x80-\x84\x86-\u200D\u2010-\u2027\u202F-\u2065\u206A-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]+$/
const bannedIdentifiers = new Set([
  'true',
  'false',
  'null',
  'inf',
  '-inf',
  'nan'
])

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {string} char
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {boolean}
 */
function shouldEscapeChar (value, options) {
  const charCode = value.charCodeAt(0)

  if (options.escapes[charCode]) {
    return true
  } else if (value === '"' || value === '\\') {
    return true
  } else if (options.escapeCommon && value in commonEscapes) {
    return true
  } else if (options.escapeNonPrintableAscii && nonPrintableAscii.test(value)) {
    return true
  } else if (options.escapeLinespace && linespace.test(value)) {
    return true
  } else if (options.escapeNonAscii && nonAscii.test(value)) {
    return true
  } else {
    return false
  }
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {string} char
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {string}
 */
function formatChar (value, options) {
  if (!shouldEscapeChar(value, options)) {
    return value
  } else if (value in commonEscapes) {
    return commonEscapes[value]
  } else {
    return `\\u{${value.charCodeAt(0).toString(16)}}`
  }
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {string} value
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {string}
 */
function formatString (value, options) {
  if (options.preferIdentifierString && identifierPattern.test(value) && !bannedIdentifiers.has(value)) {
    return value
  }

  return `"${[...value].map(char => formatChar(char, options)).join('')}"`
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {string} value
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {string}
 */
function formatIdentifier (value, options) {
  return formatString(value, { ...options, preferIdentifierString: true })
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {number} value
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {string}
 */
function formatNumber (value, options) {
  if (!Number.isFinite(value)) {
    if (value === Number.POSITIVE_INFINITY) {
      return '#inf'
    } else if (value === Number.NEGATIVE_INFINITY) {
      return '#-inf'
    } else {
      return '#nan'
    }
  }

  if (options.exponentChar === 'E') {
    return value.toString().toUpperCase()
  } else {
    return value.toString()
  }
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {string} [value] - KDL tag
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {string}
 */
function formatTag (value, options) {
  return value === undefined ? '' : '(' + formatIdentifier(value, options) + ')'
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {module:kdljs~Value} value - KDL value
 * @param {string} [tag] - KDL tag
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {string}
 */
function formatValue (value, tag, options) {
  if (typeof value === 'string') {
    return formatTag(tag, options) + formatString(value, options)
  } else if (typeof value === 'number') {
    return formatTag(tag, options) + formatNumber(value, options)
  } else {
    return formatTag(tag, options) + '#' + value
  }
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {string} key
 * @param {module:kdljs~Value} value - KDL value
 * @param {string} [tag] - KDL tag
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @return {string}
 */
function formatProperty (key, value, tag, options) {
  return formatIdentifier(key, options) + '=' + formatValue(value, tag, options)
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {module:kdljs~Node} node - KDL node
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @param {number} indent
 * @return {string}
 */
function formatNode (node, options, indent) {
  let values = node.values
  if (!options.printNullArgs) {
    values = values.filter(value => value !== null)
  }

  let properties = Object.keys(node.properties).sort()
  if (!options.printNullProps) {
    properties = properties.filter(key => node.properties[key] !== null)
  }

  const currentIndent = options.indentChar.repeat(options.indent * indent)
  const parts = [
    currentIndent + formatTag(node.tags.name, options) + formatIdentifier(node.name, options),
    ...values.map((value, index) => formatValue(value, node.tags.values[index], options)),
    ...properties.map(key => formatProperty(key, node.properties[key], node.tags.properties[key], options))
  ]

  if (node.children.length) {
    indent++
    parts.push('{' + options.newline + formatDocument(node.children, options, indent) + options.newline + currentIndent + '}')
    indent--
  } else if (options.printEmptyChildren) {
    parts.push('{}')
  }

  return options.requireSemicolons ? parts.join(' ') + ';' : parts.join(' ')
}

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {module:kdljs~Document} doc - KDL document
 * @param {module:kdljs/formatter.ProcessedOptions} options - Formatting options
 * @param {number} indent
 * @return {string}
 */
function formatDocument (doc, options, indent) {
  const nodes = doc.map(node => formatNode(node, options, indent))

  return nodes.join(options.newline)
}

/**
 * @access private
 * @typedef ProcessedOptions
 * @memberof module:kdljs.formatter
 * @type {Object}
 * @property {Object<number,boolean>} escapes
 * @property {boolean} requireSemicolons
 * @property {boolean} escapeNonAscii
 * @property {boolean} escapeNonPrintableAscii
 * @property {boolean} escapeCommon
 * @property {boolean} escapeLinespace
 * @property {string} newline
 * @property {number} indent
 * @property {string} indentChar
 * @property {string} exponentChar
 * @property {string} preferIdentifierString
 * @property {boolean} printEmptyChildren
 * @property {boolean} printNullArgs
 * @property {boolean} printNullProps
 */

/**
 * @access private
 * @memberof module:kdljs.formatter
 * @param {module:kdljs/formatter.Options} options - Formatting options
 * @return {module:kdljs/formatter.ProcessedOptions}
 */
function processOptions (options) {
  return {
    escapes: {},
    requireSemicolons: false,
    escapeNonAscii: false,
    escapeNonPrintableAscii: true,
    escapeCommon: true,
    escapeLinespace: true,
    newline: '\n',
    indent: 4,
    indentChar: ' ',
    exponentChar: 'E',
    preferIdentifierString: false,
    printEmptyChildren: false,
    printNullArgs: true,
    printNullProps: true,
    ...options
  }
}

/**
 * @typedef Options
 * @memberof module:kdljs.formatter
 * @type {Object}
 * @property {Object<number,boolean>} [escapes={}] - A map of which characters to escape (by decimal codepoint)
 * @property {boolean} [requireSemicolons=false] - Whether to print semicolons after each node
 * @property {boolean} [escapeNonAscii=false] - Whether to escape any non-ASCII characters
 * @property {boolean} [escapeNonPrintableAscii=true] - Whether to escape non-printable ASCII characters
 * @property {boolean} [escapeCommon=true] - Whether to escape common characters (i.e. those with single-character escape codes)
 * @property {boolean} [escapeLinespace=true] - Whether to escape linespace characters
 * @property {string} [newline='\n'] - The newline character
 * @property {number} [indent=4] - The number of characters (from `indentChar`) to indent each level with
 * @property {string} [indentChar=' '] - What character to indent with
 * @property {string} [exponentChar='E'] - What character to use for the exponent in floats (`e` or `E`)
 * @property {boolean} [preferIdentifierString=false] - Whether to prefer identifier-style strings
 * @property {boolean} [printEmptyChildren=false] - Whether to print empty brackets if a node has no children
 * @property {boolean} [printNullArgs=true] - Whether to print `null` values
 * @property {boolean} [printNullProps=true] - Whether to print properties with value `null`
 */

/**
 * @function format
 * @memberof module:kdljs.formatter
 * @param {module:kdljs~Document} doc - Input KDL document
 * @param {module:kdljs.formatter.Options} [options={}] - Formatting options
 * @return {string} formatted KDL file
 */
module.exports.format = function format (doc, options) {
  if (!validateDocument(doc)) {
    throw new TypeError('Invalid KDL document')
  }

  const processsedOptions = processOptions(options || {})

  return formatDocument(doc, processsedOptions, 0) + processsedOptions.newline
}
