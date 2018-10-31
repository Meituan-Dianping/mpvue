/* @flow */

import { baseOptions } from './options'
import { createCompiler } from './create-compiler'
import codeGenWx from './codegen/index'
import codeGenSwan from './codegen-swan/index'

function compileToWxml (compiled, options, fileExt) {
    debugger
    let code
    switch(fileExt.platform) {
        case 'swan':
            code = codeGenSwan(compiled, options)
            break
        case 'wx':
            code = codeGenWx(compiled, options)
            break
        default:
            code = codeGenWx(compiled, options)
    }
    return code
}

const { compile, compileToFunctions } = createCompiler(baseOptions)
export { compile, compileToFunctions, compileToWxml }
