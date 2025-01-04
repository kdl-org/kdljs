/**
 * @namespace base
 * @memberof module:kdljs.parser
 */

const { EmbeddedActionsParser, MismatchedTokenException } = require('chevrotain')
const Tokens = require('./tokens.js')

/**
 * @type Object<string, string>
 * @memberof module:kdljs.parser.base
 */
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

/**
 * @type Object<string, number>
 * @memberof module:kdljs.parser.base
 */
const radix = {
  b: 2,
  o: 8,
  x: 16
}

/**
 * @type Object<string, number>
 * @memberof module:kdljs.parser.base
 */
const floatKeywords = {
  '#inf': Infinity,
  '#-inf': -Infinity,
  '#nan': NaN
}

/**
 * @type Set<string>
 * @memberof module:kdljs.parser.base
 */
const bannedIdentifiers = new Set([
  'true',
  'false',
  'null',
  'inf',
  '-inf',
  'nan'
])

/**
 * @class
 * @memberof module:kdljs.parser.base
 */
class BaseParser extends EmbeddedActionsParser {
  constructor (tokens) {
    super(tokens)

    /**
     * Consume a tag
     * @method #tag
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('tag', () => {
      this.CONSUME(Tokens.LeftParenthesis)
      this.OPTION(() => this.SUBRULE(this.nodeSpace))
      const tag = this.SUBRULE(this.string)
      this.OPTION1(() => this.SUBRULE1(this.nodeSpace))
      this.CONSUME(Tokens.RightParenthesis)
      return tag
    })

    /**
     * Consume a value
     * @method #value
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {module:kdljs~Value}
     */
    this.RULE('value', () => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.string) },
        { ALT: () => this.CONSUME(Tokens.Boolean).image === '#true' },
        {
          ALT: () => {
            this.CONSUME(Tokens.Null)
            return null
          }
        },
        {
          ALT: () => {
            const keyword = this.CONSUME(Tokens.FloatKeyword).image
            return floatKeywords[keyword]
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
        }
      ])
    })

    /**
     * Consume a normal string
     * @method #string
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('string', () => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.identifierString) },
        { ALT: () => this.SUBRULE(this.quotedString) },
        { ALT: () => this.SUBRULE(this.rawString) }
      ])
    })

    /**
     * Consume an identifierString
     * @method #identifierString
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('identifierString', () => {
      const prevToken = this.LA(0)
      const identifier = this.CONSUME(Tokens.Identifier)

      if (bannedIdentifiers.has(identifier.image)) {
        const error = new MismatchedTokenException('Bare identifier string must not be a keyword', identifier, prevToken)
        throw this.SAVE_ERROR(error)
      }

      return identifier.image
    })

    /**
     * Consume a quoted string
     * @method #quotedString
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('quotedString', () => {
      let string = ''

      this.CONSUME(Tokens.OpenQuote)
      this.MANY(() => {
        string += this.OR([
          { ALT: () => this.CONSUME(Tokens.Unicode).image },
          { ALT: () => escapes[this.CONSUME(Tokens.Escape).image] },
          { ALT: () => this.SUBRULE(this.unicodeEscape) },
          {
            ALT: () => {
              this.CONSUME(Tokens.WhiteSpaceEscape)
              return ''
            }
          }
        ])
      })
      this.CONSUME(Tokens.CloseQuote)

      return string
    })

    /**
     * Consume a raw string
     * @method #rawString
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('rawString', () => {
      const string = this.CONSUME(Tokens.RawString).image
      const start = string.indexOf('"')
      return string.slice(start + 1, -start)
    })

    /**
     * Consume a Unicode escape
     * @method #unicodeEscape
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('unicodeEscape', () => {
      const prevToken = this.LA(0)
      const escape = this.CONSUME(Tokens.UnicodeEscape)
      const codepoint = parseInt(escape.image.slice(3, -1), 16)

      // Unicode scalar values
      if (codepoint >= 0xD800 && codepoint <= 0xDFFF) {
        const message = 'Strings may not contain escaped Unicode Scalar Values (U+D800 to U+DFFF)'
        const error = new MismatchedTokenException(message, escape, prevToken)
        throw this.SAVE_ERROR(error)
      }

      return String.fromCharCode(codepoint)
    })

    /**
     * Consume node space
     * @method #nodeSpace
     * @memberof module:kdljs.parser.kdl.BaseParser
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
     * @memberof module:kdljs.parser.kdl.BaseParser
     */
    this.RULE('lineContinuation', () => {
      this.CONSUME(Tokens.EscLine)
      this.OPTION(() => this.SUBRULE(this.whiteSpace))
      this.OR([
        { ALT: () => this.SUBRULE(this.lineComment) },
        { ALT: () => this.CONSUME(Tokens.NewLine) },
        { ALT: () => this.CONSUME(Tokens.EOF) }
      ])
    })

    /**
     * Consume a line comment
     * @method #lineComment
     * @memberof module:kdljs.parser.kdl.BaseParser
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
     * @memberof module:kdljs.parser.kdl.BaseParser
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
     * @memberof module:kdljs.parser.kdl.BaseParser
     */
    this.RULE('whiteSpace', () => {
      this.AT_LEAST_ONE(() => {
        this.OR([
          { ALT: () => this.CONSUME(Tokens.WhiteSpace) },
          { ALT: () => this.SUBRULE(this.multilineComment) }
        ])
      })
    })
  }

  /**
   * @method
   * @param {string} input - Input KDL file (or fragment)
   * @param {Object} error
   * @param {string} [message] - Override the error message
   * @param {Object} [options] - Further configuration
   * @param {number} [options.context=3] - How many lines before the problematic line to include
   * @return {string}
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

module.exports.escapes = escapes
module.exports.radix = radix
module.exports.BaseParser = BaseParser
