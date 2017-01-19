/* @flow */

import { callHook } from 'core/instance/lifecycle'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

const patternTypes = [String, RegExp]

function getComponentName (opts: ?VNodeComponentOptions): ?string {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern: string | RegExp, name: string): boolean {
  if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (pattern instanceof RegExp) {
    return pattern.test(name)
  }
  return false
}

function pruneCache (cache, filter) {
  for (const key in cache) {
    const cachedNode = cache[key]
    if (cachedNode) {
      const name = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cachedNode)
        cache[key] = null
      }
    }
  }
}

function pruneCacheEntry (vnode: ?MountedComponentVNode) {
  if (vnode) {
    if (!vnode.componentInstance._inactive) {
      callHook(vnode.componentInstance, 'deactivated')
    }
    vnode.componentInstance.$destroy()
  }
}

export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes
  },

  created () {
    this.cache = Object.create(null)
  },

  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache[key])
    }
  },

  watch: {
    include (val: string | RegExp) {
      pruneCache(this.cache, name => matches(val, name))
    },
    exclude (val: string | RegExp) {
      pruneCache(this.cache, name => !matches(val, name))
    }
  },

  render () {
    const vnode: VNode = getFirstComponentChild(this.$slots.default)
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name = getComponentName(componentOptions)
      if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
        return vnode
      }
      const key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (this.cache[key]) {
        vnode.componentInstance = this.cache[key].componentInstance
      } else {
        this.cache[key] = vnode
      }
      vnode.data.keepAlive = true
    }
    return vnode
  }
}
