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
            this.OPTION1(() => this.SUBRULE(this.nodeSpace))
            this.SUBRULE(this.node)
          }
        },
        { ALT: () => this.SUBRULE(this.lineComment) },
        { ALT: () => this.SUBRULE(this.whiteSpace) },
        { ALT: () => this.CONSUME(Tokens.NewLine) },
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
        name: this.OPTION1(() => this.SUBRULE(this.tag)),
        properties: {},
        values: []
      }
      const name = this.SUBRULE(this.identifier)
      const properties = {}
      const values = []

      const next = this.LA(1).tokenType
      if (next !== Tokens.NewLine && next !== Tokens.SemiColon && next !== Tokens.EOF) {
        this.SUBRULE(this.nodeSpace)
      }

      this.MANY(() => {
        this.OR1([
          {
            GATE: this.BACKTRACK(this.property),
            ALT: () => {
              const parts = this.SUBRULE(this.property)
              properties[parts[0]] = parts[1]
              tags.properties[parts[0]] = parts[2]
            }
          },
          {
            GATE: this.BACKTRACK(this.taggedValue),
            ALT: () => {
              const parts = this.SUBRULE(this.taggedValue)
              values.push(parts[0])
              tags.values.push(parts[1])
            }
          },
          {
            ALT: () => {
              this.CONSUME(Tokens.BlockComment)
              this.OPTION2(() => this.SUBRULE(this.nodeSpace))
              this.OR([
                {
                  GATE: this.BACKTRACK(this.property),
                  ALT: () => this.SUBRULE1(this.property)
                },
                {
                  GATE: this.BACKTRACK(this.taggedValue),
                  ALT: () => this.SUBRULE1(this.taggedValue)
                }
              ])
            }
          }
        ])

        const next = this.LA(1).tokenType
        if (next !== Tokens.LeftBrace && next !== Tokens.NewLine &&
            next !== Tokens.SemiColon && next !== Tokens.EOF) {
          this.SUBRULE1(this.nodeSpace)
        }
      })

      const children = this.OR2([
        {
          ALT: () => {
            const children = this.SUBRULE(this.nodeChildren)
            this.OPTION(() => this.SUBRULE(this.nodeTerminator))
            return children
          }
        },
        {
          ALT: () => {
            this.SUBRULE1(this.nodeTerminator)
            return []
          }
        },
        {
          ALT: () => {
            this.CONSUME1(Tokens.BlockComment)
            this.OPTION3(() => this.SUBRULE1(this.nodeSpace))
            this.SUBRULE1(this.nodeChildren)
            this.OPTION4(() => this.SUBRULE2(this.nodeTerminator))
            return []
          }
        }
      ])

      return { name, properties, values, children, tags }
    })

    /**
     * Consume a property
     * @method #property
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {Array<string,module:kdljs~Value>} key-value pair
     */
    this.RULE('property', () => {
      const key = this.SUBRULE(this.identifier)
      this.CONSUME(Tokens.Equals)
      const parts = this.SUBRULE(this.taggedValue)
      return [key, parts[0], parts[1]]
    })

    /**
     * Consume a tagged value
     * @method #taggedValue
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {module:kdljs~Value}
     */
    this.RULE('taggedValue', () => {
      const tag = this.OPTION(() => this.SUBRULE(this.tag))
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
     * Consume a node pace
     * @method #nodeSpace
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('nodeSpace', () => {
      this.AT_LEAST_ONE(() => this.OR([
        { ALT: () => this.SUBRULE(this.whiteSpace) },
        { ALT: () => this.SUBRULE(this.lineContinuation) }
      ]))
    })

    /**
     * Consume a line continuation
     * @method #lineContinuation
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('lineContinuation', () => {
      this.CONSUME(Tokens.EscLine)
      this.OPTION(() => this.SUBRULE1(this.whiteSpace))
      this.OPTION1(() => this.CONSUME(Tokens.LineComment))
      this.OR([
        { ALT: () => this.CONSUME(Tokens.NewLine) },
        { ALT: () => this.CONSUME(Tokens.EOF) }
      ])
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

    /**
     * Consume a line comment
     * @method #lineComment
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('lineComment', () => {
      this.CONSUME(Tokens.LineComment)
      this.OR([
        { ALT: () => this.CONSUME(Tokens.NewLine) },
        { ALT: () => this.CONSUME(Tokens.EOF) }
      ])
    })

    /**
     * Consume a multiline comment
     * @method #multilineComment
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('multilineComment', () => {
      this.CONSUME(Tokens.OpenMultiLineComment)
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Tokens.MultiLineCommentContent) },
          { ALT: () => this.SUBRULE(this.multilineComment) }
        ])
      })
      this.CONSUME(Tokens.CloseMultiLineComment)
    })

    /**
     * Consume whitespace
     * @method #whiteSpace
     * @memberof module:kdljs.parser.kdl.KdlParser
     */
    this.RULE('whiteSpace', () => {
      this.AT_LEAST_ONE(() => {
        this.OR([
          { ALT: () => this.CONSUME(Tokens.BOM) },
          { ALT: () => this.CONSUME(Tokens.WhiteSpace) },
          { ALT: () => this.SUBRULE(this.multilineComment) }
        ])
      })
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
