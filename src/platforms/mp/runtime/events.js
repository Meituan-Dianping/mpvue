import { getComKey, eventTypeMap } from '../util/index'
import { noop } from 'shared/util'

function getVM (vm, comkeys = []) {
  const keys = comkeys.slice(1)
  if (!keys.length) return vm

  return keys.reduce((res, key) => {
    const len = res.$children.length
    for (let i = 0; i < len; i++) {
      const v = res.$children[i]
      const k = getComKey(v)
      if (k === key) {
        res = v
        return res
      }
    }
    return res
  }, vm)
}

function getHandle (vnode, eventid, eventTypes = []) {
  let res = []
  if (!vnode || !vnode.tag) {
    return res
  }

  const { data = {}, children = [], componentInstance } = vnode || {}
  if (componentInstance) {
    // 增加 slot 情况的处理
    // Object.values 会多增加几行编译后的代码
    Object.keys(componentInstance.$slots).forEach(slotKey => {
      const slot = componentInstance.$slots[slotKey]
      const slots = Array.isArray(slot) ? slot : [slot]
      slots.forEach(node => {
        res = res.concat(getHandle(node, eventid, eventTypes))
      })
    })
  } else {
    // 避免遍历超出当前组件的 vm
    children.forEach(node => {
      res = res.concat(getHandle(node, eventid, eventTypes))
    })
  }

  const { attrs, on } = data
  if (attrs && on && attrs['eventid'] === eventid) {
    eventTypes.forEach(et => {
      const h = on[et]
      if (typeof h === 'function') {
        res.push(h)
      } else if (Array.isArray(h)) {
        res = res.concat(h)
      }
    })
    return res
  }

  return res
}

function getWebEventByMP (e) {
  const { type, timeStamp, touches, detail = {}, target = {}, currentTarget = {}} = e
  const { x, y } = detail
  const event = {
    mp: e,
    type,
    timeStamp,
    x,
    y,
    target: Object.assign({}, target, detail),
    currentTarget,
    stopPropagation: noop,
    preventDefault: noop
  }

  if (touches && touches.length) {
    Object.assign(event, touches[0])
    event.touches = touches
  }
  return event
}

export function handleProxyWithVue (e) {
  const rootVueVM = this.$root
  const { type, target = {}, currentTarget } = e
  const { dataset = {}} = currentTarget || target
  const { comkey = '', eventid } = dataset
  const vm = getVM(rootVueVM, comkey.split(','))

  if (!vm) {
    return
  }

  const webEventTypes = eventTypeMap[type] || [type]
  const handles = getHandle(vm._vnode, eventid, webEventTypes)

  // TODO, enevt 还需要处理更多
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Event
  if (handles.length) {
    const event = getWebEventByMP(e)
    if (handles.length === 1) {
      const result = handles[0](event)
      return result
    }
    handles.forEach(h => h(event))
  }
}
