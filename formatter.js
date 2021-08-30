/** @module kdljs/formatter */

/**
 * @access private
 * @param {module:kdljs~Document} doc - KDL document
 * @return {boolean}
 */
function validateDocument (doc) {
  return !Array.isArray(doc) || !doc.every(node => validateNode(node))
}

/**
 * @access private
 * @param {module:kdljs~Node} node - KDL node
 * @return {boolean}
 */
function validateNode (node) {
  if (typeof node !== 'object') {
    return false
  }

  if (!Object.prototype.hasOwnProperty.call(node, 'name') ||
      typeof node.name !== 'string') {
    return false
  }

  if (!Object.prototype.hasOwnProperty.call(node, 'values') ||
      !Array.isArray(node.values) ||
      !node.values.every(value => validateValue(value))) {
    return false
  }

  if (!Object.prototype.hasOwnProperty.call(node, 'properties') ||
      typeof node.properties !== 'object' ||
      !Object.values(node.properties).every(value => validateValue(value))) {
    return false
  }

  if (!Object.prototype.hasOwnProperty.call(node, 'children') ||
      !validateDocument(node.children)) {
    return false
  }

  return true
}

/**
 * @access private
 * @param {module:kdljs~Value} value - KDL value
 * @return {boolean}
 */
function validateValue (value) {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean' || type === 'null'
}

/**
 * @access private
 * @param {string} value
 * @return {string}
 */
function formatString (value) {
  return `"${value.replace(/[\\"]/g, '\\$&')}"`
}

/**
 * @access private
 * @param {string} value
 * @return {string}
 */
function formatIdentifier (value) {
  if (/^[\x21-\x2F\x3A\x3F-\x5A\x5E-\x7A\x7C\x7E-\uFFFF][\x21-\x3A\x3F-\x5A\x5E-\x7A\x7C\x7E-\uFFFF]+$/.test(value)) {
    return value
  } else {
    return formatString(value)
  }
}

/**
 * @access private
 * @param {module:kdljs~Value} value - KDL value
 * @return {string}
 */
function formatValue (value) {
  if (typeof value === 'string') {
    return formatString(value)
  } else {
    return value + ''
  }
}

/**
 * @access private
 * @param {string} key
 * @param {module:kdljs~Value} value - KDL value
 * @return {string}
 */
function formatProperty (key, value) {
  return formatIdentifier(key) + '=' + formatValue(value)
}

/**
 * @access private
 * @param {module:kdljs~Node} node - KDL node
 * @param {object} indent
 * @param {number} indent.level
 * @param {string} indent.string
 * @return {string}
 */
function formatNode (node, indent) {
  const parts = [
    formatIdentifier(node.name),
    ...node.values.map(value => formatValue(value)),
    ...Object.entries(node.properties).map(([key, value]) => formatProperty(key, value))
  ]

  if (node.children.length) {
    parts.push('{\n' + formatDocument(node.children, indent) + '\n}')
  }

  return parts.join(' ')
}

/**
 * @access private
 * @param {module:kdljs~Document} doc - KDL document
 * @param {object} indent
 * @param {number} indent.level
 * @param {string} indent.string
 * @return {string}
 */
function formatDocument (doc, indent) {
  const currentIndent = indent.string.repeat(indent.level)
  indent.level++
  const nodes = doc.map(node => currentIndent + formatNode(node, indent))
  indent.level--

  return nodes.join('\n\n')
}

/**
 * @function parse
 * @param {module:kdljs~Document} doc - Input KDL document
 * @return {string} formatted KDL file
 */
module.exports.format = function format (doc) {
  if (!validateDocument(doc)) {
    throw new TypeError('Invalid KDL document')
  }

  const indent = {
    string: '  ',
    level: 0
  }

  return formatDocument(doc, indent) + '\n'
}
