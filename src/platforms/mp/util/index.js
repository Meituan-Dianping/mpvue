/* globals renderer */

import { makeMap } from 'shared/util'

export const isPreTag = (tag) => tag === 'pre'

export const isReservedTag = makeMap(
  'template,script,style,element,content,slot,link,meta,svg,view,' +
  'a,div,img,image,text,span,richtext,input,switch,textarea,spinner,select,' +
  'slider,slider-neighbor,indicator,trisition,trisition-group,canvas,' +
  'list,cell,header,loading,loading-indicator,refresh,scrollable,scroller,' +
  'video,web,embed,tabbar,tabheader,datepicker,timepicker,marquee,countdown',
  true
)

// these are reserved for web because they are directly compiled away
// during template compilation
export const isReservedAttr = makeMap('style,class')

// Elements that you can, intentionally, leave open (and which close themselves)
// more flexable than web
export const canBeLeftOpenTag = makeMap(
  'web,spinner,switch,video,textarea,canvas,' +
  'indicator,marquee,countdown',
  true
)

export const isUnaryTag = makeMap(
  'embed,img,image,input,link,meta',
  true
)

export function mustUseProp () { /* console.log('mustUseProp') */ }
export function getTagNamespace () { /* console.log('getTagNamespace') */ }
export function isUnknownElement () { /* console.log('isUnknownElement') */ }

export function query (el, document) {
  // renderer is injected by weex factory wrapper
  const placeholder = new renderer.Comment('root')
  placeholder.hasAttribute = placeholder.removeAttribute = function () {} // hack for patch
  document.documentElement.appendChild(placeholder)
  return placeholder
}

export function getComKey (vm) {
  return vm && vm.$attrs ? vm.$attrs['mpcomid'] : '0'
}

// 用于小程序的 event type 到 web 的 event
export const eventTypeMap = {
  tap: ['tap', 'click'],
  touchstart: ['touchstart'],
  touchmove: ['touchmove'],
  touchcancel: ['touchcancel'],
  touchend: ['touchend'],
  longtap: ['longtap'],
  input: ['input'],
  blur: ['change', 'blur'],
  submit: ['submit'],
  focus: ['focus'],
  scrolltoupper: ['scrolltoupper'],
  scrolltolower: ['scrolltolower'],
  scroll: ['scroll']
}

// vm上的数据深拷贝
function isObject (obj) {
  return (typeof obj === 'object' || typeof obj === 'function') && obj !== null
}

export function cloneDeep (data, hash = new WeakMap()) {
  if (!isObject(data)) {
    return data
  }
  if (!data || !data.constructor) {
    return data
  }
  let copyData
  const Constructor = data.constructor
  // 实际情况中，正则表达式会被以{}存储，Date对象会以时间字符串形式存储
  // 函数则变为null
  switch (Constructor) {
    case RegExp:
      copyData = new Constructor(data)
      break
    case Date:
      copyData = new Constructor(data.getTime())
      break
    default:
      // 循环引用问题解决
      if (hash.has(data)) {
        return hash.get(data)
      }
      copyData = new Constructor()
      hash.set(data, copyData)
  }
  // 属性名称为Symbol类型的拷贝
  const symbols = Object.getOwnPropertySymbols(data)
  if (symbols && symbols.length) {
    symbols.forEach(symkey => {
      copyData[symkey] = isObject(data[symkey]) ? cloneDeep(data[symkey], hash) : data[symkey]
    })
  }
  // 普通数组/纯对象遍历
  for (const key in data) {
    copyData[key] = isObject(data[key]) ? cloneDeep(data[key], hash) : data[key]
  }
  return copyData
}
