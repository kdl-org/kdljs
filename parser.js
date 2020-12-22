const {
  createToken,
  Lexer,
  EmbeddedActionsParser,
  EOF
} = require('chevrotain')

// Whitespace and comments
const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /[\x09\x20\xA0\u1680\u2000-\u200A\u202F\u205F\u3000]+/
})
const NewLine = createToken({
  name: 'NewLine',
  pattern: /\x0D\x0A|[\x0A\x0C\x85\u2028\u2029]/
})
const BlockComment = createToken({ name: 'BlockComment', pattern: /\/-/ })
const LineComment = createToken({
  name: 'LineComment',
  pattern: /\/\/[^]*?(\x0D\x0A|[\x0A\x0C\x85\u2028\u2029])/,
  line_breaks: true
})
const MultiLineComment = createToken({
  name: 'MultiLineComment',
  pattern: /\/\*[^]*?\*\//,
  line_breaks: true
})

// Values
const Boolean = createToken({ name: 'Boolean', pattern: /true|false/ })
const Null = createToken({ name: 'Null', pattern: /null/ })
const RawString = createToken({
  name: 'RawString', pattern: /r(#*)"[^]*?"\1/,
  line_breaks: true
})
const Float = createToken({
  name: 'Float',
  pattern: /[+-]?[0-9][0-9_]*(\.[0-9]+)?([eE][+-]?[0-9][0-9_]*)?/
})
const Integer = createToken({
  name: 'Integer',
  pattern: /0x[0-9a-fA-F][0-9a-fA-F_]*|0o[0-7][0-7_]*|0b[01][01_]*/
})

// Other
const Identifier = createToken({
  name: 'Identifier',
  pattern: /[\x21-\x2F\x3A\x3F-\x5A\x5E-\x7A\x7C\x7E-\uFFFF][\x21-\x3A\x3F-\x5A\x5E-\x7A\x7C\x7E-\uFFFF]*/
})
const SemiColon = createToken({ name: 'SemiColon', pattern: /;/ })
const Equals = createToken({ name: 'Equals', pattern: /=/ })
const LeftBrace = createToken({ name: 'LeftBrace', pattern: /\{/ })
const RightBrace = createToken({ name: 'RightBrace', pattern: /\}/ })
const EscLine = createToken({ name: 'EscLine', pattern: /\\/})

// String
const OpenQuote = createToken({ name: 'OpenQuote', pattern: /"/, push_mode: 'string' })
const Unicode = createToken({
  name: 'Unicode',
  pattern: /[^\\"]+/,
  line_breaks: true
})
const Escape = createToken({ name: 'Escape', pattern: /\\[nrt\\"bf]/ })
const UnicodeEscape = createToken({ name: 'UnicodeEscape', pattern: /\\u\{[0-9a-fA-F]{0,6}\}/ })
const CloseQuote = createToken({ name: 'CloseQuote', pattern: /"/, pop_mode: true })

const tokens = {
  defaultMode: 'main',
  modes: {
    main: [
      WhiteSpace,
      NewLine,
      BlockComment,
      LineComment,
      MultiLineComment,
      Boolean,
      Null,
      RawString,
      Float,
      Integer,
      SemiColon,
      Equals,
      LeftBrace,
      RightBrace,
      EscLine,
      OpenQuote,
      Identifier,
    ],
    string: [
      Unicode,
      Escape,
      UnicodeEscape,
      CloseQuote
    ]
  }
}

const escapes = {
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t',
  '\\\\': '\\',
  '\\"': '"',
  '\\b': '\x08',
  '\\f': '\x0C'
}

const radix = {
  b: 2,
  o: 8,
  h: 16
}

class KdlParser extends EmbeddedActionsParser {
  constructor () {
    super(tokens)

    this.RULE('nodes', () => {
      const nodes = []

      this.MANY(() => this.OR([
        { ALT: () => {
          this.CONSUME(BlockComment)
          this.OPTION1(() => this.CONSUME1(WhiteSpace))
          this.SUBRULE(this.node)
        } },
        { ALT: () => this.CONSUME(LineComment) },
        { ALT: () => this.CONSUME(MultiLineComment) },
        { ALT: () => this.CONSUME(WhiteSpace) },
        { ALT: () => this.CONSUME(NewLine) },
        { ALT: () => nodes.push(this.SUBRULE1(this.node)) }
      ]))

      return nodes
    })

    this.RULE('node', () => {
      const name = this.OR([
        { ALT: () => this.CONSUME(Identifier).image },
        { ALT: () => this.SUBRULE(this.string) }
      ])

      const properties = {}
      const values = []
      this.MANY(() => {
        this.SUBRULE(this.nodeSpace)
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
          }
        ])
      })

      this.SUBRULE1(this.nodeSpace)
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
        }
      ])

      return { name, properties, values, children }
    })

    this.RULE('property', () => {
      const key = this.OR([
        { ALT: () => this.CONSUME(Identifier).image },
        { ALT: () => this.SUBRULE(this.string) }
      ])
      this.CONSUME(Equals)
      const value = this.SUBRULE(this.value)
      return [key, value]
    })

    this.RULE('nodeChildren', () => {
      this.CONSUME(LeftBrace)
      const nodes = this.SUBRULE(this.nodes)
      this.CONSUME(RightBrace)
      return nodes
    })

    this.RULE('nodeSpace', () => {
      this.MANY(() => this.OR([
        { ALT: () => this.CONSUME(WhiteSpace) },
        { ALT: () => {
          this.CONSUME(EscLine)
          this.OPTION(() => this.CONSUME1(WhiteSpace))
          this.OR1([
            { ALT: () => this.CONSUME(LineComment) },
            { ALT: () => this.CONSUME(NewLine) }
          ])
        } },
        { ALT: () => {
          this.CONSUME(BlockComment)
          this.OPTION1(() => this.CONSUME2(WhiteSpace))
          this.OR2([
            {
              GATE: this.BACKTRACK(this.property),
              ALT: () => this.SUBRULE(this.property)
            },
            {
              GATE: this.BACKTRACK(this.value),
              ALT: () => this.SUBRULE(this.value)
            },
            { ALT: () => this.SUBRULE(this.nodeChildren) }
          ])
        } }
      ]))
    })

    this.RULE('nodeTerminator', () => {
      this.MANY(() => this.OR([
        { ALT: () => this.CONSUME(NewLine) },
        { ALT: () => this.CONSUME(SemiColon) }
      ]))
    })

    this.RULE('value', () => this.OR([
      { ALT: () => this.SUBRULE(this.string) },
      { ALT: () => parseFloat(this.CONSUME(Float).image) },
      { ALT: () => this.CONSUME(Boolean).image === 'true' },
      { ALT: () => (this.CONSUME(Null), null) },
      {
        ALT: () => {
          const number = this.CONSUME(Integer).image.slice(1).replace(/_/g, '')
          return parseInt(number.slice(1), radix[number[0]])
        }
      },
      {
        ALT: () => {
          const string = this.CONSUME(RawString).image
          const start = string.indexOf('"')
          return string.slice(start + 1, -start)
        }
      }
    ]))

    this.RULE('string', () => {
      let string = ''

      this.CONSUME(OpenQuote)
      this.MANY(() => {
        string += this.OR([
          { ALT: () => this.CONSUME(Unicode).image },
          { ALT: () => escapes[this.CONSUME(Escape).image] },
          {
            ALT: () => {
              const escape = this.CONSUME(UnicodeEscape).image.slice(3, -1)
              return String.fromCharCode(parseInt(escape, 16))
            }
          }
        ])
      })
      this.CONSUME(CloseQuote)

      return string
    })

    this.performSelfAnalysis()
  }

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
const parser = new KdlParser()

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
