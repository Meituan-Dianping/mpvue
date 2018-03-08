import component from './component'
import tagMap from '../config/wxmlTagMap'

export default function (ast, options) {
  const { tag, elseif, else: elseText, for: forText, staticClass = '', attrsMap = {}} = ast
  const { components } = options
  const { 'v-if': ifText, href, 'v-bind:href': bindHref, name } = attrsMap

  if (!tag) {
    return ast
  }
  const isComponent = component.isComponent(tag, components)
  if (tag !== 'template' && tag !== 'block' && tag !== 'slot' && !isComponent) {
    ast.staticClass = staticClass ? `_${tag} ${staticClass}` : `_${tag}`
  }
  ast.tag = tagMap[tag] || tag

  const isSlot = tag === 'slot'

  if ((ifText || elseif || elseText || forText) && tag === 'template') {
    ast.tag = 'block'
  } else if (isComponent || isSlot) {
    const originSlotName = name || 'default'
    const slotName = isSlot ? `$slot${originSlotName} || '${originSlotName}'` : undefined

    // 用完必须删除，不然会被编译成 <template name="xxx"> 在小程序中就会表示这是一个模版申明而不是使用，小程序中不能同时申明和使用模版
    delete ast.attrsMap.name
    ast = component.convertComponent(ast, components, slotName)
    ast.tag = 'template'
  } else if (tag === 'a' && !(href || bindHref)) {
    ast.tag = 'view'
  } else if (ast.events && ast.events.scroll) {
    ast.tag = 'scroll-view'
  } else if (tag === 'input') {
    const type = attrsMap.type
    if (type && ['button', 'checkbox', 'radio'].indexOf(type) > -1) {
      delete ast.attrsMap.type
      ast.tag = type
    }
    if (type === 'button') {
      ast.children.push({
        text: attrsMap.value || '',
        type: 3
      })
      delete ast.attrsMap.value
    }
  }
  return ast
}
