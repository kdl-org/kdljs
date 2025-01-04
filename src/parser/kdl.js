/**
 * @namespace kdl
 * @memberof module:kdljs.parser
 */

const { Lexer, MismatchedTokenException, createTokenInstance } = require('chevrotain')
const { BaseParser } = require('./base.js')
const Tokens = require('./tokens.js')

const tokens = {
  defaultMode: 'main',
  modes: {
    main: [
      Tokens.WhiteSpace,
      Tokens.BOM,
      Tokens.NewLine,
      Tokens.BlockComment,
      Tokens.LineComment,
      Tokens.OpenMultiLineComment,
      Tokens.Boolean,
      Tokens.Null,
      Tokens.FloatKeyword,
      Tokens.RawString,
      Tokens.Integer,
      Tokens.Float,
      Tokens.SemiColon,
      Tokens.Equals,
      Tokens.LeftBrace,
      Tokens.RightBrace,
      Tokens.LeftParenthesis,
      Tokens.RightParenthesis,
      Tokens.EscLine,
      Tokens.OpenQuote,
      Tokens.Identifier
    ],
    multilineComment: [
      Tokens.OpenMultiLineComment,
      Tokens.CloseMultiLineComment,
      Tokens.MultiLineCommentContent
    ],
    string: [
      Tokens.Unicode,
      Tokens.Escape,
      Tokens.UnicodeEscape,
      Tokens.WhiteSpaceEscape,
      Tokens.CloseQuote
    ]
  }
}

/**
 * @class
 * @extends module:kdljs.parser.base.BaseParser
 * @memberof module:kdljs.parser.kdl
 */
class KdlParser extends BaseParser {
  constructor () {
    super(tokens)

    /**
     * Consume a KDL document
     * @method #document
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {module:kdljs~Document}
     */
    this.RULE('document', () => {
      this.OPTION(() => this.CONSUME(Tokens.BOM))
      const nodes = this.SUBRULE(this.nodes)
      this.CONSUME(Tokens.EOF)
      return nodes
    })

    /**
     * Consume a sequence of KDL nodes
     * @method #nodes
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {module:kdljs~Document}
     */
    this.RULE('nodes', () => {
      const nodes = []

      this.MANY(() => this.OR([
        {
          ALT: () => {
            this.CONSUME(Tokens.BlockComment)
            this.OPTION1(() => this.SUBRULE(this.lineSpace))
            this.SUBRULE(this.node)
          }
        },
        { ALT: () => this.SUBRULE1(this.lineSpace) },
        { ALT: () => nodes.push(this.SUBRULE1(this.node)) }
      ]))

      return nodes
    })

    /**
     * Consume a KDL node
     * @method #node
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {module:kdljs~Node}
     */
    this.RULE('node', () => {
      const tags = {
        name: this.OPTION(() => {
          const tag = this.SUBRULE(this.tag)
          this.OPTION1(() => this.SUBRULE(this.nodeSpace))
          return tag
        }),
        properties: {},
        values: []
      }
      const name = this.SUBRULE(this.string)
      const properties = {}
      const values = []

      this.MANY(() => {
        this.SUBRULE1(this.nodeSpace)

        const commented = this.OPTION2(() => {
          this.CONSUME(Tokens.BlockComment)
          this.OPTION3(() => this.SUBRULE(this.lineSpace))
          return true
        })

        this.OR1([
          {
            GATE: this.BACKTRACK(this.property),
            ALT: () => {
              const parts = this.SUBRULE(this.property)
              if (!commented) {
                properties[parts[0]] = parts[1]
                tags.properties[parts[0]] = parts[2]
              }
            }
          },
          {
            GATE: this.BACKTRACK(this.taggedValue),
            ALT: () => {
              const parts = this.SUBRULE(this.taggedValue)
              if (!commented) {
                values.push(parts[0])
                tags.values.push(parts[1])
              }
            }
          }
        ])
      })

      this.MANY1(() => {
        this.SUBRULE2(this.nodeSpace)
        this.SUBRULE(this.nodeChildrenSlashdash)
      })

      const children = this.OPTION4(() => {
        this.SUBRULE3(this.nodeSpace)
        const children = this.SUBRULE(this.nodeChildren)
        return children
      }) ?? []

      this.MANY2(() => {
        this.SUBRULE4(this.nodeSpace)
        this.SUBRULE1(this.nodeChildrenSlashdash)
      })

      this.OPTION5(() => this.SUBRULE5(this.nodeSpace))

      if (this.LA(1).tokenType !== Tokens.RightBrace) {
        this.SUBRULE(this.nodeTerminator)
      }

      return { name, properties, values, children, tags }
    })

    /**
     * Consume slashdashed node children
     * @method #nodeChildrenSlashdash
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('nodeChildrenSlashdash', () => {
      this.CONSUME(Tokens.BlockComment)
      this.OPTION(() => this.SUBRULE(this.lineSpace))
      this.SUBRULE(this.nodeChildren)
    })

    /**
     * Consume a property
     * @method #property
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {[string, module:kdljs~Value>, string]} key-value-type tuple
     */
    this.RULE('property', () => {
      const key = this.SUBRULE(this.string)
      this.OPTION(() => this.SUBRULE(this.nodeSpace))
      this.CONSUME(Tokens.Equals)
      this.OPTION1(() => this.SUBRULE1(this.nodeSpace))
      const parts = this.SUBRULE(this.taggedValue)
      return [key, parts[0], parts[1]]
    })

    /**
     * Consume a tagged value
     * @method #taggedValue
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {[module:kdljs~Value, string]} value-type tuple
     */
    this.RULE('taggedValue', () => {
      const tag = this.OPTION(() => {
        const tag = this.SUBRULE(this.tag)
        this.OPTION1(() => this.SUBRULE(this.nodeSpace))
        return tag
      })
      const value = this.SUBRULE(this.value)
      return [value, tag]
    })

    /**
     * Consume node children
     * @method #nodeChildren
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {module:kdljs~Document}
     */
    this.RULE('nodeChildren', () => {
      this.CONSUME(Tokens.LeftBrace)
      const nodes = this.SUBRULE(this.nodes)
      this.CONSUME(Tokens.RightBrace)
      return nodes
    })

    /**
     * Consume line space
     * @method #lineSpace
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('lineSpace', () => {
      this.AT_LEAST_ONE(() => this.OR([
        { ALT: () => this.SUBRULE(this.nodeSpace) },
        { ALT: () => this.CONSUME(Tokens.NewLine) },
        { ALT: () => this.SUBRULE(this.lineComment) }
      ]))
    })

    /**
     * Consume a node terminator
     * @method #nodeTerminator
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('nodeTerminator', () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.lineComment) },
        { ALT: () => this.CONSUME(Tokens.NewLine) },
        { ALT: () => this.CONSUME(Tokens.SemiColon) },
        { ALT: () => this.CONSUME(Tokens.EOF) }
      ])
    })

    this.performSelfAnalysis()
  }
}

/**
 * @access private
 * @memberof module:kdljs.parser.kdl
 * @param {Object} error
 * @param {string} error.message
 * @param {number} error.offset
 * @param {number} error.length
 * @param {number} error.line
 * @param {number} error.column
 * @param {Object[]} tokens
 * @param {string} text
 * @return {Object}
 */
function transformLexerError (error, tokens, text) {
  const endOffset = error.offset + error.length
  const image = text.slice(error.offset, endOffset)
  const lines = image.split(/\r?\n/g)
  const prevToken = tokens.find(token => token.endOffset + 1 === error.offset)

  return new MismatchedTokenException(
    error.message,
    createTokenInstance(
      Tokens.Unknown,
      image,
      error.offset,
      endOffset,
      error.line,
      error.line + lines.length - 1,
      error.column,
      error.column + lines[lines.length - 1].length
    ),
    prevToken
  )
}

const lexer = new Lexer(tokens)
/**
 * @constant {module:kdljs.parser.kdl.KdlParser}
 * @memberof module:kdljs.parser.kdl
 */
const parser = new KdlParser()

/**
 * @typedef ParseResult
 * @memberof module:kdljs.parser.kdl
 * @type {Object}
 * @property {Array} errors - Parsing errors
 * @property {module:kdljs~Document} output - KDL Document
 */

/**
 * @function parse
 * @memberof module:kdljs.parser.kdl
 * @param {string} text - Input KDL file (or fragment)
 * @return {module:kdljs.parser.kdl.ParseResult} Output
 */
module.exports.parse = function parse (text) {
  const { tokens, errors } = lexer.tokenize(text)

  if (errors.length) {
    return {
      output: undefined,
      errors: errors.map(error => transformLexerError(error, tokens, text))
    }
  }

  parser.input = tokens
  const output = parser.document()

  return {
    output,
    errors: parser.errors
  }
}

module.exports.lexer = lexer
module.exports.parser = parser
module.exports.KdlParser = KdlParser
