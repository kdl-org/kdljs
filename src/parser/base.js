/**
 * @namespace base
 * @memberof module:kdljs.parser
 */

const { EmbeddedActionsParser } = require('chevrotain')
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
 * @class
 * @memberof module:kdljs.parser.base
 */
class BaseParser extends EmbeddedActionsParser {
  constructor (tokens) {
    super(tokens)

    /**
     * Consume an identifier
     * @method #identifier
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('identifier', () => {
      return this.OR([
        { ALT: () => this.CONSUME(Tokens.Identifier).image },
        { ALT: () => this.SUBRULE(this.string) },
        { ALT: () => this.SUBRULE(this.rawString) }
      ])
    })

    /**
     * Consume a tag
     * @method #tag
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('tag', () => {
      this.CONSUME(Tokens.LeftParenthesis)
      const tag = this.SUBRULE(this.identifier)
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
        { ALT: () => this.SUBRULE(this.rawString) },
        { ALT: () => this.CONSUME(Tokens.Identifier).image }
      ])
    })

    /**
     * Consume a normal string
     * @method #string
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
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
          },
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
