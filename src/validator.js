/**
 * @namespace validator
 * @memberof module:kdljs
 */

/**
 * @memberof module:kdljs.validator
 * @param {module:kdljs~Document} doc - KDL document
 * @return {boolean}
 */
export function validateDocument (doc) {
  return Array.isArray(doc) && doc.every(node => validateNode(node))
}

/**
 * @access private
 * @memberof module:kdljs.validator
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

  if (!Object.prototype.hasOwnProperty.call(node, 'tags') ||
      !validateTags(node.tags)) {
    return false
  }

  return true
}

/**
 * @access private
 * @memberof module:kdljs.validator
 * @param {module:kdljs~NodeTypeAnnotations} tags - KDL node type annotations
 * @return {boolean}
 */
function validateTags (tags) {
  if (typeof tags !== 'object') {
    return false
  }

  if (!Object.prototype.hasOwnProperty.call(tags, 'values') || !Array.isArray(tags.values)) {
    return false
  }

  if (!Object.prototype.hasOwnProperty.call(tags, 'properties') || typeof tags.properties !== 'object') {
    return false
  }

  return true
}

/**
 * @access private
 * @memberof module:kdljs.validator
 * @param {module:kdljs~Value} value - KDL value
 * @return {boolean}
 */
function validateValue (value) {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean' || value === null
}
