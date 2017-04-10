const path = require('path')
const { readFile, access } = require('fs')
const { execFile } = require('child_process')
const { getOptions } = require('loader-utils')
const bsb = require.resolve('bs-platform/bin/bsb')

const outputDir = 'lib'

const getJsFile = (moduleDir, resourcePath) => {
  const mlFileName = resourcePath.replace(process.cwd(), '')
  const jsFileName = mlFileName.replace(/\.(ml|re)$/, '.js')
  return path.join(process.cwd(), outputDir, moduleDir, jsFileName)
}

const runBsb = callback => {
  execFile(bsb, ['-make-world'], callback)
}

module.exports = function () {
  const options = getOptions(this) || {}
  const moduleDir = options.module || 'js'
  const callback = this.async()
  const interfaceFile = this.resourcePath + 'i'
  access(interfaceFile, err => {
    if (!err) {
      this.addDependency(interfaceFile)
    }
    const compiledFilePath = getJsFile(moduleDir, this.resourcePath)

    runBsb((err, res) => {
      if (err) {
        this.emitError(res)
        callback(err)
      } else {
        readFile(compiledFilePath, callback)
      }
    })
  })
}
