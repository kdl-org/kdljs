const package = require('./package.json')
const version = package.version.match(/(0\.)*\d+/)[0]

module.exports = {
  plugins: ['plugins/markdown'],
  markdown: {
    idInHeadings: true
  },
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure']
  },
  source: {
    include: [
      'index.js',
      'parser.js',
      'formatter.js'
    ]
  },
  opts: {
    destination: './docs/' + version + '/',
    encoding: 'utf8',
    readme: './README.md'
  },
  templates: {
    default: {
      includeDate: true
    },
    cleverLinks: false,
    monospaceLinks: false
  }
}
