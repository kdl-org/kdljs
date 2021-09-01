/** @module kdljs/validator */

/**
 * @access private
 * @param {module:kdljs~Document} doc - KDL document
 * @return {boolean}
 */
function validateDocument (doc) {
  return Array.isArray(doc) && doc.every(node => validateNode(node))
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
  return type === 'string' || type === 'number' || type === 'boolean' || value === null
}

module.exports.validateDocument = validateDocument
