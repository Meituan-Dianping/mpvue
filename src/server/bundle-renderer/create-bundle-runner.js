const vm = require('vm')
const path = require('path')
const resolve = require('resolve')
const NativeModule = require('module')

function createContext (context) {
  const sandbox = {
    Buffer,
    console,
    process,
    setTimeout,
    setInterval,
    setImmediate,
    clearTimeout,
    clearInterval,
    clearImmediate,
    __VUE_SSR_CONTEXT__: context
  }
  sandbox.global = sandbox
  return sandbox
}

function compileModule (files, basedir) {
  const compiledScripts = {}
  const resolvedModules = {}

  function getCompiledScript (filename) {
    if (compiledScripts[filename]) {
      return compiledScripts[filename]
    }
    const code = files[filename]
    const wrapper = NativeModule.wrap(code)
    const script = new vm.Script(wrapper, {
      filename,
      displayErrors: true
    })
    compiledScripts[filename] = script
    return script
  }

  function evaluateModule (filename, context, evaluatedFiles) {
    if (evaluatedFiles[filename]) {
      return evaluatedFiles[filename]
    }

    const script = getCompiledScript(filename)
    const compiledWrapper = script.runInNewContext(context)
    const m = { exports: {}}
    const r = file => {
      file = path.join('.', file)
      if (files[file]) {
        return evaluateModule(file, context, evaluatedFiles)
      } else if (basedir) {
        return require(
          resolvedModules[file] ||
          (resolvedModules[file] = resolve.sync(file, { basedir }))
        )
      } else {
        return require(file)
      }
    }
    compiledWrapper.call(m.exports, m.exports, r, m)

    const res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
      ? m.exports.default
      : m.exports
    evaluatedFiles[filename] = res
    return res
  }
  return evaluateModule
}

export function createBundleRunner (entry, files, basedir) {
  const evaluate = compileModule(files, basedir)
  return (_context = {}) => new Promise((resolve, reject) => {
    const context = createContext(_context)
    const evaluatedFiles = _context._evaluatedFiles = {}
    const res = evaluate(entry, context, evaluatedFiles)
    resolve(typeof res === 'function' ? res(_context) : res)
  })
}
