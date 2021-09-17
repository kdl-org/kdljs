/**
 * @namespace kdl
 * @memberof module:kdljs.parser
 */

const { Lexer, EmbeddedActionsParser } = require('chevrotain')
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

const escapes = {
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t',
  '\\\\': '\\',
  '\\/': '/',
  '\\"': '"',
  '\\b': '\x08',
  '\\f': '\x0C'
}

const radix = {
  b: 2,
  o: 8,
  x: 16
}

/**
 * @class
 * @memberof module:kdljs.parser.kdl
 */
class KdlParser extends EmbeddedActionsParser {
  constructor () {
    super(tokens)

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
            GATE: this.BACKTRACK(this.value),
            ALT: () => values.push(this.SUBRULE(this.value))
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
                  GATE: this.BACKTRACK(this.value),
                  ALT: () => this.SUBRULE1(this.value)
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

    this.RULE('identifier', () => {
      return this.OR([
        { ALT: () => this.CONSUME(Tokens.Identifier).image },
        { ALT: () => this.SUBRULE(this.string) },
        { ALT: () => this.SUBRULE(this.rawString) }
      ])
    })

    this.RULE('tag', () => {
      this.CONSUME(Tokens.LeftParenthesis)
      const tag = this.SUBRULE(this.identifier)
      this.CONSUME(Tokens.RightParenthesis)
      return tag
    })

    this.RULE('property', () => {
      const key = this.SUBRULE(this.identifier)
      this.CONSUME(Tokens.Equals)
      const value = this.SUBRULE(this.value)
      return [key, value]
    })

    this.RULE('nodeChildren', () => {
      this.CONSUME(Tokens.LeftBrace)
      const nodes = this.SUBRULE(this.nodes)
      this.CONSUME(Tokens.RightBrace)
      return nodes
    })

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

    this.RULE('nodeTerminator', () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.lineComment) },
        { ALT: () => this.CONSUME(Tokens.NewLine) },
        { ALT: () => this.CONSUME(Tokens.SemiColon) },
        { ALT: () => this.CONSUME(Tokens.EOF) }
      ])
    })

    this.RULE('value', () => {
      this.OPTION(() => this.SUBRULE(this.tag))
      return this.OR([
        { ALT: () => this.SUBRULE(this.string) },
        { ALT: () => this.CONSUME(Tokens.Boolean).image === 'true' },
        {
          ALT: () => {
            this.CONSUME(Tokens.Null)
            return null
          }
        },
        {
          ALT: () => {
            const number = this.CONSUME(Tokens.Float).image.replace(/_/g, '')
            return parseFloat(number, 10)
          }
        },
        {
          ALT: () => {
            const token = this.CONSUME(Tokens.Integer).image
            const sign = token.startsWith('-') ? -1 : 1
            const number = token.replace(/^[+-]?0|_/g, '')
            return sign * parseInt(number.slice(1), radix[number[0]])
          }
        },
        { ALT: () => this.SUBRULE(this.rawString) }
      ])
    })

    this.RULE('string', () => {
      let string = ''

      this.CONSUME(Tokens.OpenQuote)
      this.MANY(() => {
        string += this.OR([
          { ALT: () => this.CONSUME(Tokens.Unicode).image },
          { ALT: () => escapes[this.CONSUME(Tokens.Escape).image] },
          {
            ALT: () => {
              const escape = this.CONSUME(Tokens.UnicodeEscape).image.slice(3, -1)
              return String.fromCharCode(parseInt(escape, 16))
            }
          }
        ])
      })
      this.CONSUME(Tokens.CloseQuote)

      return string
    })

    this.RULE('rawString', () => {
      const string = this.CONSUME(Tokens.RawString).image
      const start = string.indexOf('"')
      return string.slice(start + 1, -start)
    })

    this.RULE('lineComment', () => {
      this.CONSUME(Tokens.LineComment)
      this.OR([
        { ALT: () => this.CONSUME(Tokens.NewLine) },
        { ALT: () => this.CONSUME(Tokens.EOF) }
      ])
    })

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

  /**
   * @method
   * @param {string} input - Input KDL file (or fragment)
   * @param {Object} error
   * @param {string} [message] - Override the error message
   * @param {Object} [options] - Further configuration
   * @param {number} [options.context=3] - How many lines before the problematic line to include
   */
  formatError (input, error, message = error.message, { context = 3 } = {}) {
    let output = message + '\n'

    const { startLine, endLine, startColumn, endColumn } = error.token
    const lines = input.split('\n')
    output += lines.slice(startLine - Math.min(startLine, context), endLine).join('\n')
    output += '\n'

    output += ' '.repeat(startColumn - 1) + '^'.repeat(endColumn - startColumn + 1)
    output += ` at ${startLine}:${startColumn}\n`

    output += error.context.ruleStack
      .map(rule => '  ' + rule)
      .join('\n')

    return output
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
