/**
 * @namespace kql
 * @memberof module:kdljs.parser
 */

const { Lexer } = require('chevrotain')
const { BaseParser } = require('./base.js')
const Tokens = require('./tokens.js')

const tokens = {
  defaultMode: 'main',
  modes: {
    main: [
      Tokens.LeftBracket,
      Tokens.RightBracket,
      Tokens.GreaterOrEqualThan,
      Tokens.LessOrEqualThan,
      Tokens.GreaterThan,
      Tokens.LessThan,
      Tokens.Or,
      Tokens.AdjacentSibling,
      Tokens.Sibling,
      Tokens.NotEquals,
      Tokens.StartsWith,
      Tokens.EndsWith,
      Tokens.Contains,
      Tokens.Map,
      Tokens.TopAccessor,
      Tokens.ValAccessor,
      Tokens.PropAccessor,
      Tokens.Accessor,
      Tokens.Comma,

      Tokens.WhiteSpace,
      Tokens.Boolean,
      Tokens.Null,
      Tokens.RawString,
      Tokens.Integer,
      Tokens.Float,
      Tokens.Equals,
      Tokens.LeftParenthesis,
      Tokens.RightParenthesis,
      Tokens.OpenQuote,
      Tokens.Identifier
    ],
    string: [
      Tokens.Unicode,
      Tokens.Escape,
      Tokens.UnicodeEscape,
      Tokens.CloseQuote
    ]
  }
}

/**
 * @class
 * @extends module:kdljs.parser.base.BaseParser
 * @memberof module:kdljs.parser.kql
 */
class KqlParser extends BaseParser {
  constructor () {
    super(tokens)

    /**
     * Consume a query
     * @method #query
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {module:kdljs.query.Query}
     */
    this.RULE('query', () => {
      const alternatives = [this.SUBRULE(this.selector)]

      this.MANY(() => {
        this.CONSUME(Tokens.Or)
        this.CONSUME1(Tokens.WhiteSpace)

        const selector = this.SUBRULE1(this.selector)
        alternatives.push(selector)
      })

      const mapping = this.OPTION(() => {
        this.CONSUME(Tokens.Map)
        this.CONSUME2(Tokens.WhiteSpace)
        return this.SUBRULE(this.mapTuple)
      })

      this.CONSUME(Tokens.EOF)

      return {
        alternatives,
        mapping
      }
    })

    /**
     * Consume a selector
     * @method #selector
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {module:kdljs.query.Selector}
     */
    this.RULE('selector', () => {
      const selector = [this.SUBRULE(this.nodeFilter)]
      this.OR([
        { ALT: () => this.CONSUME(Tokens.WhiteSpace) },
        { ALT: () => this.CONSUME(Tokens.EOF) }
      ])

      this.MANY(() => {
        const operator = this.OPTION(() => {
          const operator = this.SUBRULE(this.selectionOperator)
          this.CONSUME1(Tokens.WhiteSpace)
          return operator
        })

        const nodeFilter = this.SUBRULE1(this.nodeFilter)
        selector.push({ ...nodeFilter, operator })

        this.OR1([
          { ALT: () => this.CONSUME2(Tokens.WhiteSpace) },
          { ALT: () => this.CONSUME1(Tokens.EOF) }
        ])
      })

      return selector
    })

    /**
     * Consume a nodeFilter
     * @method #nodeFilter
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {module:kdljs.query.NodeFilter}
     */
    this.RULE('nodeFilter', () => {
      const matchers = []
      this.AT_LEAST_ONE(() => {
        matchers.push(this.SUBRULE(this.matcher))
      })
      return { matchers }
    })

    /**
     * Consume a matcher
     * @method #matcher
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {module:kdljs.query.Matcher}
     */
    this.RULE('matcher', () => {
      return this.OR([
        {
          ALT: () => ({
            accessor: { type: 'name' },
            operator: '=',
            value: this.SUBRULE(this.identifier)
          })
        },
        {
          ALT: () => {
            this.CONSUME(Tokens.TopAccessor)
            this.CONSUME(Tokens.RightParenthesis)
            return { accessor: { type: 'top' } }
          }
        },
        {
          ALT: () => {
            this.CONSUME1(Tokens.LeftParenthesis)
            this.CONSUME1(Tokens.RightParenthesis)
            return { accessor: { type: 'tag' } }
          }
        },
        {
          ALT: () => ({
            accessor: { type: 'tag' },
            operator: '=',
            value: this.SUBRULE(this.tag)
          })
        },
        { ALT: () => this.SUBRULE(this.accessorMatcher) }
      ])
    })

    /**
     * Consume a [accessor]-type matcher
     * @method #accessorMatcher
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {module:kdljs.query.Matcher}
     */
    this.RULE('accessorMatcher', () => {
      this.CONSUME(Tokens.LeftBracket)
      const matcher = this.OPTION(() => {
        const accessor = this.SUBRULE(this.accessor)
        const matcher = this.OPTION1(() => {
          this.CONSUME(Tokens.WhiteSpace)
          const operator = this.SUBRULE(this.matcherOperator)
          this.CONSUME1(Tokens.WhiteSpace)

          const value = this.OR([
            { ALT: () => this.SUBRULE(this.value) },
            { ALT: () => ({ tag: this.SUBRULE(this.tag) }) }
          ])

          return { accessor, operator, value }
        })

        return matcher || { accessor }
      })
      this.CONSUME(Tokens.RightBracket)

      return matcher || {}
    })

    /**
     * Consume an accessor
     * @method #accessor
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {module:kdljs.query.Accessor}
     */
    this.RULE('accessor', () => {
      return this.OR([
        {
          ALT: () => {
            this.CONSUME(Tokens.ValAccessor)
            const parameter = this.OPTION(() => this.SUBRULE(this.value))
            this.CONSUME(Tokens.RightParenthesis)

            return { type: 'val', parameter }
          }
        },
        {
          ALT: () => {
            this.CONSUME(Tokens.PropAccessor)
            const parameter = this.SUBRULE(this.identifier)
            this.CONSUME1(Tokens.RightParenthesis)

            return { type: 'prop', parameter }
          }
        },
        {
          ALT: () => {
            const type = this.CONSUME(Tokens.Accessor).image.slice(0, -1)
            this.CONSUME2(Tokens.RightParenthesis)

            return { type }
          }
        },
        {
          ALT: () => {
            const parameter = this.SUBRULE1(this.identifier)
            return { type: 'prop', parameter }
          }
        }
      ])
    })

    /**
     * Consume an operator within selectors
     * @method #selectionOperator
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {string}
     */
    this.RULE('selectionOperator', () => {
      return this.OR([
        { ALT: () => this.CONSUME(Tokens.GreaterThan) },
        { ALT: () => this.CONSUME(Tokens.AdjacentSibling) },
        { ALT: () => this.CONSUME(Tokens.Sibling) }
      ]).image
    })

    /**
     * Consume an operator within matchers
     * @method #matcherOperator
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {string}
     */
    this.RULE('matcherOperator', () => {
      return this.OR([
        { ALT: () => this.CONSUME(Tokens.GreaterThan) },
        { ALT: () => this.CONSUME(Tokens.LessThan) },
        { ALT: () => this.CONSUME(Tokens.GreaterOrEqualThan) },
        { ALT: () => this.CONSUME(Tokens.LessOrEqualThan) },
        { ALT: () => this.CONSUME(Tokens.Equals) },
        { ALT: () => this.CONSUME(Tokens.NotEquals) },
        { ALT: () => this.CONSUME(Tokens.StartsWith) },
        { ALT: () => this.CONSUME(Tokens.EndsWith) },
        { ALT: () => this.CONSUME(Tokens.Contains) }
      ]).image
    })

    /**
     * Consume a mapping
     * @method #mapTuple
     * @memberof module:kdljs.parser.kql.KqlParser
     * @return {module:kdljs.query.Mapping}
     */
    this.RULE('mapTuple', () => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.accessor) },
        {
          ALT: () => {
            this.CONSUME(Tokens.LeftParenthesis)

            const tuple = [this.SUBRULE1(this.accessor)]
            this.MANY(() => {
              this.CONSUME(Tokens.Comma)
              this.CONSUME(Tokens.WhiteSpace)
              tuple.push(this.SUBRULE2(this.accessor))
            })

            this.CONSUME(Tokens.RightParenthesis)
            return tuple
          }
        }
      ])
    })

    this.performSelfAnalysis()
  }
}

const lexer = new Lexer(tokens)
/**
 * @constant {module:kdljs.parser.kql.KqlParser}
 * @memberof module:kdljs.parser.kql
 */
const parser = new KqlParser()

/**
 * @typedef ParseResult
 * @memberof module:kdljs.parser.kql
 * @type {Object}
 * @property {Array} errors - Parsing errors
 * @property {module:kdljs.queryEngine.Query} output - KQL query
 */

/**
 * @function parse
 * @memberof module:kdljs.parser.kql
 * @param {string} text - Input KQL file (or fragment)
 * @return {module:kdljs.parser.kql.ParseResult} Output
 */
module.exports.parse = function parse (text) {
  parser.input = lexer.tokenize(text).tokens
  const output = parser.query()

  return {
    output,
    errors: parser.errors
  }
}

module.exports.lexer = lexer
module.exports.parser = parser
module.exports.KqlParser = KqlParser
