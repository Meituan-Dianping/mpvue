/* @flow */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

import { warn } from 'core/util/index'
import { camelize, extend } from 'shared/util'
import { mergeVNodeHook, getFirstComponentChild } from 'core/vdom/helpers'

export const transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String
}

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recrusively retrieve the real component to be rendered
function getRealChild (vnode: ?VNode): ?VNode {
  const compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

export function extractTransitionData (comp: Component): Object {
  const data = {}
  const options = comp.$options
  // props
  for (const key in options.propsData) {
    data[key] = comp[key]
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  const listeners = options._parentListeners
  for (const key in listeners) {
    data[camelize(key)] = listeners[key].fn
  }
  return data
}

export default {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render (h: Function) {
    let children = this.$slots.default
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(c => c.tag)
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (process.env.NODE_ENV !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      )
    }

    const mode = this.mode

    // warn invalid mode
    if (process.env.NODE_ENV !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in') {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      )
    }

    const rawChild = children[0]

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (this.$vnode.parent && this.$vnode.parent.data.transition) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    const child = getRealChild(rawChild)
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    child.key = child.key == null
      ? `__v${child.tag + this._uid}__`
      : child.key
    const data = (child.data || (child.data = {})).transition = extractTransitionData(this)
    const oldRawChild = this._vnode
    const oldChild: any = getRealChild(oldRawChild)

    if (oldChild && oldChild.data && oldChild.key !== child.key) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      const oldData = oldChild.data.transition = extend({}, data)

      // handle transition mode
      if (mode === 'out-in') {
        // return empty node and queue update when leave finishes
        mergeVNodeHook(oldData, 'afterLeave', () => {
          this.$forceUpdate()
        })
        return /\d-keep-alive$/.test(rawChild.tag)
          ? h('keep-alive')
          : null
      } else if (mode === 'in-out') {
        let delayedLeave
        const performLeave = () => { delayedLeave() }
        mergeVNodeHook(data, 'afterEnter', performLeave)
        mergeVNodeHook(data, 'enterCancelled', performLeave)
        mergeVNodeHook(oldData, 'delayLeave', leave => {
          delayedLeave = leave
        })
      }
    }

    return rawChild
  }
}
