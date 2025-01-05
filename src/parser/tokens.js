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
  pattern: /\/\/([^\x00-\x08\x0A-\x1F\x7F\x85\u200E\u200F\u2028-\u202E\u2066-\u2069\uD800-\uDFFF\uFEFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])*/,
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
  // eslint-disable-next-line no-control-regex
  pattern: /(?![+-]?\.?\d)([^\x00-\x20\x22-\x23\x28-\x29\x2F\x3B\x3D\x5B-\x5D\x7B\x7D\x7F\x85\xA0\u1680\u2000-\u200A\u200E\u200F\u2028-\u202F\u205F\u2066-\u2069\u3000\uD800-\uDFFF\uFEFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])+/
})
const Boolean = createToken({ name: 'Boolean', pattern: /#true|#false/ })
const Null = createToken({ name: 'Null', pattern: /#null/ })
const FloatKeyword = createToken({ name: 'FloatKeyword', pattern: /#inf|#-inf|#nan/ })
const RawString = createToken({
  name: 'RawString',
  // eslint-disable-next-line no-control-regex
  pattern: /(#+)"([^\x00-\x08\x0A-\x1F\x7F\x85\u200E\u200F\u2028-\u202E\u2066-\u2069\uD800-\uDFFF\uFEFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])*?"\1/
})
const MultiLineRawString = createToken({
  name: 'MultiLineRawString',
  // eslint-disable-next-line no-control-regex
  pattern: /(#+)"""([^\x00-\x08\x0E-\x1F\x7F\u200E\u200F\u202A-\u202E\u2066-\u2069\uD800-\uDFFF\uFEFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])*?"""\1/,
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
  // eslint-disable-next-line no-control-regex
  pattern: /([^\\"\x00-\x08\x0A-\x1F\x7F\x85\u200E\u200F\u2028-\u202E\u2066-\u2069\uD800-\uDFFF\uFEFF]|[\uD800-\uDBFF][\uDC00-\uDFFF])+/
})
const Escape = createToken({ name: 'Escape', pattern: /\\[nrt\\"bfs]/ })
const UnicodeEscape = createToken({ name: 'UnicodeEscape', pattern: /\\u\{([0-9a-fA-F]{1,5}|10[0-9a-fA-F]{4})\}/ })
const WhiteSpaceEscape = createToken({
  name: 'WhiteSpaceEscape',
  // eslint-disable-next-line no-control-regex
  pattern: /\\[\x09\x0A-\x0D\x20\x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/,
  line_breaks: true
})
const CloseQuote = createToken({ name: 'CloseQuote', pattern: /"/, pop_mode: true })

const MultiLineOpenQuote = createToken({ name: 'MultiLineOpenQuote', pattern: /"""/, push_mode: 'multilineString' })
const MultiLineCloseQuote = createToken({ name: 'MultiLineCloseQuote', pattern: /"""/, pop_mode: true })
const MultiLineSingleQuote = createToken({ name: 'MultiLineSingleQuote', pattern: /"/ })

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
  MultiLineRawString,
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
  MultiLineOpenQuote,
  MultiLineCloseQuote,
  MultiLineSingleQuote,
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
