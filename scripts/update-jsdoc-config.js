import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const packageRoot = path.dirname(__dirname)

const packageFile = path.join(packageRoot, 'package.json')
const packageConfig = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
const version = packageConfig.version.match(/(0\.)*\d+/)[0]

const jsdocFile = path.join(packageRoot, '.jsdoc.json')
const jsdocConfig = fs.readFileSync(jsdocFile, 'utf8')
const updatedJsdocConfig = jsdocConfig.replace(/"\.\/docs\/.+?\/"/, '"./docs/' + version + '/"')

fs.writeFileSync(jsdocFile, updatedJsdocConfig)
