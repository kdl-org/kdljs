const { createToken, EOF } = require('chevrotain')

// Whitespace and comments
const WhiteSpace = createToken({
  name: 'WhiteSpace',
  // eslint-disable-next-line no-control-regex
  pattern: /[\x09\x20\xA0\u1680\u2000-\u200A\u202F\u205F\u3000]+/
})
const BOM = createToken({
  name: 'BOM',
  // eslint-disable-next-line no-control-regex
  pattern: /\uFEFF/
})
const NewLine = createToken({
  name: 'NewLine',
  // eslint-disable-next-line no-control-regex
  pattern: /\x0D\x0A|[\x0A-\x0D\x85\u2028\u2029]/
})
const BlockComment = createToken({ name: 'BlockComment', pattern: /\/-/ })
const LineComment = createToken({
  name: 'LineComment',
  // eslint-disable-next-line no-control-regex
  pattern: /\/\/[^\x00-\x19\x7F\x85\u200E\u200F\u2028-\u202E\u2066-\u2069\uD800-\uDFFF]*/,
  line_breaks: true
})
const OpenMultiLineComment = createToken({
  name: 'OpenMultiLineComment',
  pattern: /\/\*/,
  push_mode: 'multilineComment'
})
const MultiLineCommentContent = createToken({
  name: 'MultiLineCommentContent',
  pattern: /([^/*]+|\*|\/)/,
  line_breaks: true
})
const CloseMultiLineComment = createToken({
  name: 'CloseMultiLineComment',
  pattern: /\*\//,
  pop_mode: 'multilineComment'
})

// Values
const Identifier = createToken({
  name: 'Identifier',
  pattern: /(?![+-]?\.?\d)[\x21\x24-\x27\x2A-\x2E\x30-\x3A\x3C\x3E-\x5A\x5E-\x7A\x7C\x7E\x80-\x84\x86-\u200D\u2010-\u2027\u202F-\u2065\u206A-\uD7FF\uE000-\uFFFF]+/
})
const Boolean = createToken({ name: 'Boolean', pattern: /#true|#false/ })
const Null = createToken({ name: 'Null', pattern: /#null/ })
const FloatKeyword = createToken({ name: 'FloatKeyword', pattern: /#inf|#-inf|#nan/ })
const RawString = createToken({
  name: 'RawString',
  pattern: /(#+)"[^\x00-\x08\x0E-\x19\x7F\u200E\u200F\u202A-\u202E\u2066-\u2069\uD800-\uDFFF]*?"\1/,
  line_breaks: true
})
const Float = createToken({
  name: 'Float',
  pattern: /[+-]?[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?/
})
const Integer = createToken({
  name: 'Integer',
  pattern: /[+-]?(0x[0-9a-fA-F][0-9a-fA-F_]*|0o[0-7][0-7_]*|0b[01][01_]*)/
})

// Other
const SemiColon = createToken({ name: 'SemiColon', pattern: /;/ })
const Equals = createToken({ name: 'Equals', pattern: /=/ })
const LeftBrace = createToken({ name: 'LeftBrace', pattern: /\{/ })
const RightBrace = createToken({ name: 'RightBrace', pattern: /\}/ })
const LeftParenthesis = createToken({ name: 'LeftParenthesis', pattern: /\(/ })
const RightParenthesis = createToken({ name: 'RightParenthesis', pattern: /\)/ })
const EscLine = createToken({ name: 'EscLine', pattern: /\\/ })
const Unknown = createToken({ name: 'Unknown', pattern: /[^]/ })

// String
const OpenQuote = createToken({ name: 'OpenQuote', pattern: /"/, push_mode: 'string' })
const Unicode = createToken({
  name: 'Unicode',
  pattern: /[^\\"\x00-\x08\x0A-\x19\x0E-\x1A\x7F\x85\u200E\u200F\u2028-\u202E\u2066-\u2069\uD800-\uDFFF]+/
})
const Escape = createToken({ name: 'Escape', pattern: /\\[nrt\\"bfs]/ })
const UnicodeEscape = createToken({ name: 'UnicodeEscape', pattern: /\\u\{([0-9a-fA-F]{1,5}|10[0-9a-fA-F]{4})\}/ })
const WhiteSpaceEscape = createToken({
  name: 'WhiteSpaceEscape',
  pattern: /\\[\x09\x0A-\x0D\x20\x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/,
  line_breaks: true
})
const CloseQuote = createToken({ name: 'CloseQuote', pattern: /"/, pop_mode: true })

// Query language
const LeftBracket = createToken({ name: 'LeftBracket', pattern: /\[/ })
const RightBracket = createToken({ name: 'RightBracket', pattern: /\]/ })
const GreaterThan = createToken({ name: 'GreaterThan', pattern: />/ })
const LessThan = createToken({ name: 'LessThan', pattern: /</ })
const GreaterOrEqualThan = createToken({ name: 'GreaterOrEqualThan', pattern: />=/ })
const LessOrEqualThan = createToken({ name: 'LessOrEqualThan', pattern: /<=/ })
const Or = createToken({ name: 'Or', pattern: /\|\|/ })
const AdjacentSibling = createToken({ name: 'AdjacentSibling', pattern: /\+/ })
const Sibling = createToken({ name: 'Sibling', pattern: /~/ })
const NotEquals = createToken({ name: 'NotEquals', pattern: /!=/ })
const StartsWith = createToken({ name: 'StartsWith', pattern: /\^=/ })
const EndsWith = createToken({ name: 'EndsWith', pattern: /\$=/ })
const Contains = createToken({ name: 'Contains', pattern: /\*=/ })
const Map = createToken({ name: 'Map', pattern: /=>/ })
const TopAccessor = createToken({ name: 'TopAccessor', pattern: /top\(/ })
const ValAccessor = createToken({ name: 'ValAccessor', pattern: /val\(/ })
const PropAccessor = createToken({ name: 'PropAccessor', pattern: /prop\(/ })
const Accessor = createToken({ name: 'Accessor', pattern: /(name|tag|values|props)\(/ })
const Comma = createToken({ name: 'Comma', pattern: /,/ })

module.exports = {
  WhiteSpace,
  BOM,
  NewLine,
  BlockComment,
  LineComment,
  Boolean,
  Null,
  FloatKeyword,
  RawString,
  Integer,
  Float,
  SemiColon,
  Equals,
  LeftBrace,
  RightBrace,
  LeftParenthesis,
  RightParenthesis,
  EscLine,
  OpenQuote,
  Identifier,
  OpenMultiLineComment,
  CloseMultiLineComment,
  MultiLineCommentContent,
  Unicode,
  Escape,
  UnicodeEscape,
  WhiteSpaceEscape,
  CloseQuote,
  LeftBracket,
  RightBracket,
  GreaterThan,
  LessThan,
  GreaterOrEqualThan,
  LessOrEqualThan,
  Or,
  AdjacentSibling,
  Sibling,
  NotEquals,
  StartsWith,
  EndsWith,
  Contains,
  Map,
  TopAccessor,
  ValAccessor,
  PropAccessor,
  Accessor,
  Comma,

  Unknown,
  EOF
}
