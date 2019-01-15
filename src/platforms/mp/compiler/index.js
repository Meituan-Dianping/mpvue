/* @flow */

import { baseOptions } from './options'
import { createCompiler } from './create-compiler'
import codeGenWx from './wx/index'
import codeGenSwan from './swan/index'
import codeGenTt from './tt/index'

function compileToMPML (compiled, options, fileExt) {
    let code
    switch(fileExt.platform) {
        case 'swan':
            code = codeGenSwan(compiled, options)
            break
        case 'wx':
            code = codeGenWx(compiled, options)
            break
        case 'tt':
            code = codeGenTt(compiled, options)
            break
        default:
            code = codeGenWx(compiled, options)
    }
    return code
}

const { compile, compileToFunctions } = createCompiler(baseOptions)
export {
    compile,
    compileToFunctions,
    compileToMPML
}
