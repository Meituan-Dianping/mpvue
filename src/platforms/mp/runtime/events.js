import { getComKey, eventTypeMap } from '../util/index'
import { noop } from 'shared/util'

// 虚拟dom的compid与真实dom的comkey匹配，多层嵌套的先补齐虚拟dom的compid直到完全匹配为止
function isVmKeyMatchedCompkey (k, comkey) {
  if (!k || !comkey) {
    return false
  }
  // 完全匹配 comkey = '1_0_1', k = '1_0_1'
  // 部分匹配 comkey = '1_0_10_1', k = '1_0_10'
  // k + KEY_SEP防止k = '1_0_1'误匹配comkey = '1_0_10_1'
  return comkey === k || comkey.indexOf(k + KEY_SEP) === 0
}

function getVM (vm, comkeys = []) {
  const keys = comkeys.slice(1)
  if (!keys.length) return vm

  // bugfix #1375: 虚拟dom的compid和真实dom的comkey在组件嵌套时匹配出错，comid会丢失前缀，需要从父节点补充
  let comkey = keys.join(KEY_SEP)
  let comidPrefix = ''
  return keys.reduce((res, key) => {
    const len = res.$children.length
    for (let i = 0; i < len; i++) {
      const v = res.$children[i]
      let k = getComKey(v)
      if (comidPrefix) {
        k = comidPrefix + KEY_SEP + k
      }
      // 找到匹配的父节点
      if (isVmKeyMatchedCompkey(k, comkey)) {
        comidPrefix = k
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
  const { type, timeStamp, touches, detail = {}, target = {}, currentTarget = {} } = e
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

const KEY_SEP = '_'
export function handleProxyWithVue (e) {
  const rootVueVM = this.$root
  const { type, target = {}, currentTarget } = e
  const { dataset = {} } = currentTarget || target
  const { comkey = '', eventid } = dataset
  const vm = getVM(rootVueVM, comkey.split(KEY_SEP))

  if (!vm) {
    return
  }

  const webEventTypes = eventTypeMap[type] || [type]
  const handles = getHandle(vm._vnode, eventid, webEventTypes)

  // TODO, event 还需要处理更多
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
