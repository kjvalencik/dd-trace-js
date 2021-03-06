'use strict'

const { expect } = require('chai')
const path = require('path')
const semver = require('semver')

if (!semver.satisfies(process.version, '>=10.12')) {
  describe = describe.skip // eslint-disable-line no-global-assign
}

describe('mapper', () => {
  const { pathToFileURL } = require('url')

  let SourceMapper
  let mapper
  let root
  let src

  beforeEach(() => {
    SourceMapper = require('../../src/profiling/mapper').SourceMapper
    mapper = new SourceMapper()
    root = path.resolve(__dirname, 'mapper', 'sourcemaps')
    src = pathToFileURL(path.join(root, 'src', 'greeter.ts')).href
  })

  it('should map with inline source maps', async () => {
    const filename = path.join(root, 'dist', `inline.js`)
    const url = pathToFileURL(filename).href

    const source = await mapper.getSource({ url, lineNumber: 11, columnNumber: 17 })

    expect(source).to.have.property('url', src)
    expect(source).to.have.property('lineNumber', 2)
    expect(source).to.have.property('columnNumber', 2)
    expect(source).to.have.property('functionName')
  })

  it('should map with source maps at an external URL', async () => {
    const filename = path.join(root, 'dist', `url.js`)
    const url = pathToFileURL(filename).href

    const source = await mapper.getSource({ url, lineNumber: 11, columnNumber: 17 })

    expect(source).to.have.property('url', src)
    expect(source).to.have.property('lineNumber', 2)
    expect(source).to.have.property('columnNumber', 2)
    expect(source).to.have.property('functionName')
  })

  it('should fallback when there is no source map', async () => {
    const filename = path.join(root, 'dist', 'missing.js')
    const url = pathToFileURL(filename).href

    const source = await mapper.getSource({
      url,
      lineNumber: 11,
      columnNumber: 17,
      functionName: 'test'
    })

    expect(source).to.have.property('url', url)
    expect(source).to.have.property('lineNumber', 11)
    expect(source).to.have.property('columnNumber', 17)
    expect(source).to.have.property('functionName', 'test')
  })

  it('should fallback for internal modules', async () => {
    const url = `internal.js`

    const source = await mapper.getSource({
      url,
      lineNumber: 11,
      columnNumber: 17,
      functionName: 'test'
    })

    expect(source).to.have.property('url', url)
    expect(source).to.have.property('lineNumber', 11)
    expect(source).to.have.property('columnNumber', 17)
    expect(source).to.have.property('functionName', 'test')
  })
})
