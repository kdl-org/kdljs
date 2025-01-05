/**
 * @namespace base
 * @memberof module:kdljs.parser
 */

const { EmbeddedActionsParser, createTokenInstance, MismatchedTokenException } = require('chevrotain')
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
        { ALT: () => this.SUBRULE(this.multilineString) },
        { ALT: () => this.SUBRULE(this.rawString) },
        { ALT: () => this.SUBRULE(this.multilineRawString) }
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
     * Consume a multiline string
     * @method #multilineString
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('multilineString', () => {
      const lines = []

      this.CONSUME(Tokens.MultiLineOpenQuote)
      let previousToken = this.CONSUME(Tokens.NewLine)
      this.MANY(() => {
        const prefix = this.OPTION(() => this.CONSUME(Tokens.WhiteSpace))

        let line = ''
        this.MANY2(() => {
          line += this.OR([
            { ALT: () => this.CONSUME1(Tokens.WhiteSpace).image },
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
        lines.push({ previousToken, prefix, line })
        previousToken = this.CONSUME1(Tokens.NewLine)
      })

      const prefix = this.OPTION1(() => this.CONSUME2(Tokens.WhiteSpace).image) ?? ''
      this.CONSUME(Tokens.MultiLineCloseQuote)

      if (prefix.length > 0) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].prefix && lines[i].prefix.image.startsWith(prefix)) {
            lines[i] = lines[i].prefix.image.slice(prefix.length) + lines[i].line
          } else {
            const error = new MismatchedTokenException('Multiline string cannot be dedented', lines[i].prefix, lines[i].previousToken)
            throw this.SAVE_ERROR(error)
          }
        }
      }

      return lines.join('\n')
    })

    /**
     * Consume a raw string
     * @method #rawString
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('rawString', () => {
      const previousToken = this.LA(0)
      const token = this.CONSUME(Tokens.RawString)
      const string = token.image

      // Incorrect raw multiline string is lexed as a simple raw string
      if (string === '#"""#') {
        const error = new MismatchedTokenException('Multiline string cannot be dedented', token, previousToken)
        throw this.SAVE_ERROR(error)
      }

      const start = string.indexOf('"') + 1
      return string.slice(start, -start)
    })

    /**
     * Consume a multiline raw string
     * @method #multilineRawString
     * @memberof module:kdljs.parser.base.BaseParser
     * @return {string}
     */
    this.RULE('multilineRawString', () => {
      const token = this.CONSUME(Tokens.MultiLineRawString)
      const string = token.image
      const start = string.indexOf('"""') + 3
      const contents = string.slice(start, -start)

      if (this.RECORDING_PHASE) {
        return contents
      }

      const newlinePattern = new RegExp(Tokens.NewLine.PATTERN.source, 'g')
      const lines = contents.split(newlinePattern)

      if (lines[0] !== '') {
        const errorToken = createTokenInstance(
          Tokens.Unicode,
          lines[0],
          token.startOffset + start,
          token.startOffset + start + lines[0].length,
          token.startLine,
          token.startLine,
          token.startColumn + start,
          token.startColumn + start + lines[0].length
        )
        const error = new MismatchedTokenException('Multiline string cannot be dedented', errorToken)
        throw this.SAVE_ERROR(error)
      }

      const prefix = lines[lines.length - 1]
      const whitespacePattern = new RegExp('^(' + Tokens.WhiteSpace.PATTERN.source + ')$')

      if (!whitespacePattern.test(prefix)) {
        const errorToken = createTokenInstance(
          Tokens.Unicode,
          prefix,
          token.endOffset - start - prefix.length,
          token.endOffset - start,
          token.endLine,
          token.endLine,
          0,
          prefix.length
        )
        const error = new MismatchedTokenException('Multiline string cannot be dedented', errorToken)
        throw this.SAVE_ERROR(error)
      }

      if (prefix.length > 0) {
        for (let i = 1; i < lines.length - 1; i++) {
          if (lines[i].startsWith(prefix)) {
            lines[i] = lines[i].slice(prefix.length)
          } else {
            const errorToken = createTokenInstance(
              Tokens.Unicode,
              lines[i],
              token.startOffset + start + lines.slice(0, i) + i,
              token.startOffset + start + lines.slice(0, i + 1) + i,
              token.startLine + i,
              token.startLine + i,
              0,
              lines[i].length
            )
            const error = new MismatchedTokenException('Multiline string cannot be dedented', )
            throw this.SAVE_ERROR(error)
          }
        }
      }

      return lines.slice(1, -1).join('\n')
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
