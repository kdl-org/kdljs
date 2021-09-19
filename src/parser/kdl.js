/**
 * @namespace kdl
 * @memberof module:kdljs.parser
 */

const { Lexer } = require('chevrotain')
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
      this.OPTION1(() => this.SUBRULE(this.tag))
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
              const pair = this.SUBRULE(this.property)
              properties[pair[0]] = pair[1]
            }
          },
          {
            GATE: this.BACKTRACK(this.taggedValue),
            ALT: () => values.push(this.SUBRULE(this.taggedValue))
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

      return { name, properties, values, children }
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
      const value = this.SUBRULE(this.taggedValue)
      return [key, value]
    })

    /**
     * Consume a tagged value
     * @method #taggedValue
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {module:kdljs~Value}
     */
    this.RULE('taggedValue', () => {
      this.OPTION(() => this.SUBRULE(this.tag))
      return this.SUBRULE(this.value)
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
        {
          ALT: () => {
            this.CONSUME(Tokens.EscLine)
            this.OPTION(() => this.SUBRULE1(this.whiteSpace))
            this.OPTION1(() => this.CONSUME(Tokens.LineComment))
            this.CONSUME(Tokens.NewLine)
          }
        }
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
  parser.input = lexer.tokenize(text).tokens
  const output = parser.nodes()

  return {
    output,
    errors: parser.errors
  }
}

module.exports.lexer = lexer
module.exports.parser = parser
module.exports.KdlParser = KdlParser
