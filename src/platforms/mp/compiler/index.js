/* @flow */

import { baseOptions } from './options'
import { createCompiler } from './create-compiler'

const { compile, compileToFunctions } = createCompiler(baseOptions)

import { compileToWxml } from './codegen/index'

export { compile, compileToFunctions, compileToWxml }
