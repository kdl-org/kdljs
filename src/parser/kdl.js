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
      Tokens.MultiLineRawString,
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
      Tokens.MultiLineOpenQuote,
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
    ],
    multilineString: [
      Tokens.NewLine,
      Tokens.WhiteSpace,
      Tokens.Unicode,
      Tokens.Escape,
      Tokens.UnicodeEscape,
      Tokens.WhiteSpaceEscape,
      Tokens.MultiLineCloseQuote
    ]
  }
}

const nodeEndTokens = new Set([
  Tokens.RightBrace,
  Tokens.LineComment,
  Tokens.NewLine,
  Tokens.SemiColon,
  Tokens.EOF
])

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
      const node = {
        name: undefined,
        properties: {},
        values: [],
        children: [],
        tags: {
          name: undefined,
          properties: {},
          values: []
        }
      }

      this.OPTION(() => {
        node.tags.name = this.SUBRULE(this.tag)
        this.OPTION1(() => this.SUBRULE(this.nodeSpace))
      })

      node.name = this.SUBRULE(this.string)

      let entriesEnded = false
      let childrenEnded = false

      this.MANY({
        GATE: () => !nodeEndTokens.has(this.LA(1).tokenType),
        DEF: () => {
          this.SUBRULE1(this.nodeSpace)

          this.OR([
            {
              GATE: () => !entriesEnded && this.BACKTRACK(this.property).call(this),
              ALT: () => {
                const parts = this.SUBRULE(this.property)
                node.properties[parts[0]] = parts[1]
                node.tags.properties[parts[0]] = parts[2]
              }
            },
            {
              GATE: () => !entriesEnded && this.BACKTRACK(this.argument).call(this),
              ALT: () => {
                const parts = this.SUBRULE(this.argument)
                node.values.push(parts[0])
                node.tags.values.push(parts[1])
              }
            },
            {
              GATE: () => !childrenEnded,
              ALT: () => {
                node.children = this.SUBRULE(this.nodeChildren)
                entriesEnded = true
                childrenEnded = true
              }
            },
            {
              ALT: () => {
                this.CONSUME(Tokens.BlockComment)
                this.OPTION2(() => this.SUBRULE(this.lineSpace))
                this.OR1([
                  {
                    GATE: () => !entriesEnded && this.BACKTRACK(this.property).call(this),
                    ALT: () => this.SUBRULE1(this.property)
                  },
                  {
                    GATE: () => !entriesEnded && this.BACKTRACK(this.argument).call(this),
                    ALT: () => this.SUBRULE1(this.argument)
                  },
                  {
                    ALT: () => {
                      this.SUBRULE1(this.nodeChildren)
                      entriesEnded = true
                    }
                  }
                ])
              }
            },
            {
              GATE: () => nodeEndTokens.has(this.LA(1).tokenType),
              ALT: () => {}
            }
          ])
        }
      })

      if (this.LA(1).tokenType !== Tokens.RightBrace) {
        this.SUBRULE(this.nodeTerminator)
      }

      return node
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
      const parts = this.SUBRULE(this.argument)
      return [key, parts[0], parts[1]]
    })

    /**
     * Consume an argument
     * @method #argument
     * @memberof module:kdljs.parser.kdl.KdlParser
     * @return {[module:kdljs~Value, string]} value-type tuple
     */
    this.RULE('argument', () => {
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
