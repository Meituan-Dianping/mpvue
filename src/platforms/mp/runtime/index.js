import Vue from 'core/index'

// for platforms
// import config from 'core/config'
import { mountComponent } from 'core/instance/lifecycle'

import {
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'mp/util/index'

import { patch } from './patch'

// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform patch function
Vue.prototype.__patch__ = patch

// public mount method
Vue.prototype.$mount = function (el, hydrating) {
  // el = el && inBrowser ? query(el) : undefined
  // return mountComponent(this, el, hydrating)

  // 初始化小程序生命周期相关
  const options = this.$options

  if (options && (options.render || options.mpType)) {
    const { mpType = 'page' } = options
    return this._initMP(mpType, () => {
      return mountComponent(this, undefined, undefined)
    })
  } else {
    return mountComponent(this, undefined, undefined)
  }
}

// for mp
import { initMP } from './lifecycle'
Vue.prototype._initMP = initMP

import { updateDataToMP, initDataToMP } from './render'
Vue.prototype.$updateDataToMP = updateDataToMP
Vue.prototype._initDataToMP = initDataToMP

import { handleProxyWithVue } from './events'
Vue.prototype.$handleProxyWithVue = handleProxyWithVue

export default Vue
