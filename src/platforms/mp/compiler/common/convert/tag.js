// import component from './component'
import tagMap from '../../common/tagMap'
import _ from 'lodash'

export default function (ast, options, component, attrs) {
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
    if (isSlot) {
      const originParent = ast.parent
      const _copyAstOne = _.cloneDeep(ast)
      const _copyAstTwo = _.cloneDeep(ast)
      const baseObject = {
        type: ast.type,
        tag: 'block'
      }
      const childOne = attrs.convertAttr(Object.assign({
        if: `$slot${originSlotName}`,
        attrsMap: {
          'v-if': `$slot${originSlotName}`
        }
      }, baseObject))
      const childTwo = attrs.convertAttr(Object.assign({
        else: `'${originSlotName}'`,
        attrsMap: {
          'v-else': ''
        }
      }, baseObject))
      _copyAstOne.attrsMap['is'] = '{{' + `$slot${originSlotName}` + '}}'
      _copyAstTwo.attrsMap['is'] = '{{' + `'${originSlotName}'` + '}}'
      _copyAstOne.parent = childOne
      _copyAstTwo.parent = childTwo
      childOne.children = [_copyAstOne]
      childTwo.children = [_copyAstTwo]
      const parentObject = {
        type: ast.type,
        tag: 'block',
        parent: originParent
      }
      childOne.parent = parentObject
      childTwo.parent = parentObject
      parentObject.children = [
        childOne,
        childTwo
      ]
      ast = parentObject
    }
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
