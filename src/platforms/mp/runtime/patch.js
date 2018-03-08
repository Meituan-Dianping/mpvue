/* @flow */

import * as nodeOps from './node-ops'
import { createPatchFunction } from 'core/vdom/patch'
// import baseModules from 'core/vdom/modules/index'
// const platformModules = []
// import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
// const modules = platformModules.concat(baseModules)

export const corePatch: Function = createPatchFunction({ nodeOps, modules: [] })

export function patch () {
  corePatch.apply(this, arguments)
  this.$updateDataToMP()
}
