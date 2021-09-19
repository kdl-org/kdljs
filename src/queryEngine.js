/**
 * @namespace queryEngine
 * @memberof module:kdljs
 */

const { parse } = require('./parser/kql.js')
const { validateDocument } = require('./validator.js')

/**
 * @typedef Query
 * @memberof module:kdljs.queryEngine
 * @type {Object}
 * @property {Array<module:kdljs.queryEngine.Selector>} alternatives - Alternative selectors
 * @property {module:kdljs.queryEngine.Mapping} [mapping] - Mapping tuple
 */

/**
 * @typedef Selector
 * @memberof module:kdljs.queryEngine
 * @type {Array<module:kdljs.queryEngine.NodeFilter>}
 */

/**
 * @typedef NodeFilter
 * @memberof module:kdljs.queryEngine
 * @type {Object}
 * @property {Array<module:kdljs.queryEngine.Matcher>} matchers
 * @property {string} [operator]
 */

/**
 * @typedef Matcher
 * @memberof module:kdljs.queryEngine
 * @type {Object}
 * @property {module:kdljs.queryEngine.Accessor} [accessor]
 * @property {string} [operator]
 * @property {module:kdljs~Value} [value] - comparison value
 */

/**
 * @typedef Accessor
 * @memberof module:kdljs.queryEngine
 * @type {Object}
 * @property {string} type
 * @property {string|number} [parameter]
 */

/**
 * @typedef Mapping
 * @memberof module:kdljs.queryEngine
 * @type {module:kdljs.queryEngine.Accessor|Array<module:kdljs.queryEngine.Accessor>}
 */

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {module:kdljs.queryEngine.Accessor} accessor
 * @param {module:kdljs~Node} node
 * @return {string|module:kdljs~Value|Array<module:kdljs~Value>|Object<string,module:kdljs~Value>|undefined} result
 */
function applyAccessor (accessor, node) {
  switch (accessor.type) {
    case 'name':
      return node.name

    case 'tag':
      // TODO tag support
      return undefined

    case 'prop':
      return node.properties[accessor.parameter]

    case 'val':
      if (accessor.parameter && typeof accessor.parameter !== 'number') {
        throw TypeError(`Value accessor requires numeric parameter, ${typeof accessor.parameter} given`)
      }
      return node.values[accessor.parameter || 0]

    case 'props':
      return node.properties

    case 'values':
      return node.values
  }
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @constant {Object<string,string|null>} operandTypes
 */
const operandTypes = {
  '=': null,
  '!=': null,

  '>': 'number',
  '<': 'number',
  '>=': 'number',
  '<=': 'number',

  '^=': 'string',
  '$=': 'string',
  '*=': 'string'
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {undefined|module:kdljs~Value} value
 * @param {string} operator
 * @throw {TypeError}
 */
function checkOperand (value, operator) {
  const type = operandTypes[operator]
  if (type && typeof value !== type) { // eslint-disable-line valid-typeof
    throw new TypeError(`Matcher with '${operator}' operator requires a ${type} value, ${typeof value} given`)
  }
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {module:kdljs.queryEngine.Matcher} matcher
 * @param {module:kdljs~Node} node
 * @return boolean
 */
function applyMatcher (matcher, node) {
  if (!matcher.accessor) { return true }
  if (matcher.accessor.type === 'props' || matcher.accessor.type === 'values') {
    return false
  }

  const value = applyAccessor(matcher.accessor, node)

  if (!matcher.operator) {
    return value != null
  } else if (!matcher.value) {
    throw new TypeError('Matcher with comparison operator requires comparison value, none given')
  } else if (typeof value !== typeof matcher.value) {
    throw new TypeError(`Matcher does not support coercion, ${typeof value} and ${typeof matcher.value} cannot be compared`)
  } else if (typeof matcher.value === 'object' && matcher.tag) {
    // TODO tag support
    return false
  }

  checkOperand(matcher.value, matcher.operator)

  switch (matcher.operator) {
    case '=': return value === matcher.value
    case '!=': return value !== matcher.value

    // Number only
    case '>': return value > matcher.value
    case '<': return value < matcher.value
    case '>=': return value >= matcher.value
    case '<=': return value <= matcher.value

    // String only
    case '^=': return value.startsWith(matcher.value)
    case '$=': return value.endsWith(matcher.value)
    case '*=': return value.includes(matcher.value)

    default: return false
  }
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {module:kdljs.queryEngine.NodeFilter} nodeFilter
 * @param {module:kdljs~Node} node
 * @return boolean
 */
function applyNodeFilter (nodeFilter, node) {
  return nodeFilter.matchers.every(matcher => applyMatcher(matcher, node))
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {Array<module:kdljs~Node>} nodes
 * @param {boolean} includeSelf
 * @return {Array<module:kdljs~Node>}
 */
function collectChildren (nodes, includeSelf) {
  const children = nodes.flatMap(node => collectChildren(node.children, true))
  return includeSelf ? nodes.concat(children) : children
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {Array<module:kdljs~Node>} nodes
 * @return {Array<module:kdljs~Node>}
 */
function collectImmediateChildren (nodes) {
  return nodes.flatMap(node => node.children)
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {Array} array
 * @return {Array}
 */
function unique (array) {
  return array.filter((value, index) => array.indexOf(value) === index)
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {module:kdljs.queryEngine.Selector} selector
 * @param {module:kdljs~Document} doc
 * @return {Array<module:kdljs~Node>}
 */
function applySelector (selector, doc) {
  if (selector[0] && selector[0].matchers[0].accessor && selector[0].matchers[0].accessor.type === 'top') {
    selector = selector.slice(1)
  }

  let nodes = [{ children: doc }]

  for (const nodeFilter of selector) {
    switch (nodeFilter.operator) {
      case '+':
      case '~':
        throw new TypeError('Sibling selectors not supported yet.')

      case '>':
        nodes = collectImmediateChildren(nodes)
        break

      case undefined:
      default:
        nodes = collectChildren(nodes)
        break
    }

    nodes = unique(nodes).filter(node => applyNodeFilter(nodeFilter, node))
  }

  return nodes
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {module:kdljs.queryEngine.Mapping} mapping
 * @param {Array<module:kdljs~Node>} nodes
 * @return {any}
 */
function applyMapping (mapping, nodes) {
  return nodes.map(node => {
    if (Array.isArray(mapping)) {
      return mapping.map(accessor => applyAccessor(accessor, node))
    } else {
      return applyAccessor(mapping, node)
    }
  })
}

/**
 * @access private
 * @memberof module:kdljs.queryEngine
 * @param {module:kdljs.queryEngine.Query} query
 * @param {module:kdljs~Document} doc
 * @return {any}
 */
function applyQuery (query, doc) {
  const nodes = unique(query.alternatives.flatMap(selector => applySelector(selector, doc)))

  if (query.mapping) {
    return applyMapping(query.mapping, nodes)
  } else {
    return nodes
  }
}

/**
 * @memberof module:kdljs.queryEngine
 * @param {module:kdljs~Document} doc - Input KDL document
 * @param {module:kdljs~QueryString} queryString - Query for selecting and/or transforming results
 * @return {any}
 */
function query (doc, queryString) {
  if (!validateDocument(doc)) {
    throw new TypeError('Invalid KDL document')
  }

  const { output, errors } = parse(queryString)
  if (errors && errors.length) {
    throw errors[0]
  }

  return applyQuery(output, doc)
}

module.exports.query = query
