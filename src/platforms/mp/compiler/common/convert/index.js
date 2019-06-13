import tag from './tag'
import tagConfig from '../config'
import { hyphenate } from 'shared/util'

function convertAst (node, options = {}, util, conventRule) {
  const { children, ifConditions, staticClass = '', mpcomid } = node
  let { tag: tagName } = node
  const { log, deps, slots, slotTemplates } = util
  let mpmlAst = Object.assign({}, node)
  const { moduleId, components } = options
  mpmlAst.tag = tagName = tagName ? hyphenate(tagName) : tagName
  // 引入 import, isSlot 是使用 slot 的编译地方，意即 <slot></slot> 的地方
  const isSlot = tagName === 'slot'
  if (isSlot) {
    deps.slots = 'slots'
    // 把当前 slot 节点包裹 template
    const defSlot = Object.assign({}, mpmlAst)
    defSlot.tag = 'template'
    const templateName = `${defSlot.attrsMap.name || 'default'}`
    defSlot.attrsMap.name = templateName
    mpmlAst.children = []
    defSlot.parent = node.parent.parent
    slotTemplates[templateName] = defSlot
  }

  const currentIsComponent = conventRule.component.isComponent(tagName, components)
  if (currentIsComponent) {
    deps[tagName] = tagName
  }

  if (moduleId && !currentIsComponent && tagConfig.virtualTag.indexOf(tagName) < 0) {
    mpmlAst.staticClass = staticClass ? `${moduleId} ${staticClass}`.replace(/\"/g, '') : moduleId
  } else {
    mpmlAst.staticClass = staticClass.replace(/\"/g, '')
  }

  // 组件内部的node节点全部是 slot
  mpmlAst.slots = {}
  if (currentIsComponent && children && children.length) {
    // 只检查组件下的子节点（不检查孙子节点）是不是具名 slot，不然就是 default slot
    children
      .reduce((res, n) => {
        const { slot } = n.attrsMap || {}
        // 不是具名的，全部放在第一个数组元素中
        const arr = slot ? res : res[0]
        arr.push(n)
        return res
      }, [[]])
      .forEach(n => {
        const isDefault = Array.isArray(n)
        const slotName = isDefault ? 'default' : n.attrsMap.slot
        const slotId = `${moduleId}-${slotName}-${mpcomid.replace(/\'/g, '')}`
        if (!isDefault) {
          delete n.attrsMap.slot
        }
        const node = { tag: 'slot', attrsMap: {}, children: isDefault ? n : [n] }
        node.tag = 'template'
        node.attrsMap.name = slotId
        // 缓存，会集中生成一个 slots 文件
        slots[slotId] = { node: convertAst(node, options, util, conventRule), name: slotName, slotId }
        mpmlAst.slots[slotName] = slotId
      })
    // 清理当前组件下的节点信息，因为 slot 都被转移了
    children.length = 0
    mpmlAst.children.length = 0
  }

  mpmlAst.attrsMap = conventRule.attrs.format(mpmlAst.attrsMap)
  mpmlAst = tag(mpmlAst, options, conventRule.component, conventRule.attrs)
  mpmlAst = conventRule.convertFor(mpmlAst, options)
  mpmlAst = conventRule.attrs.convertAttr(mpmlAst, log)
  if (children && !isSlot) {
    mpmlAst.children = children.map((k) => convertAst(k, options, util, conventRule))
  }

  if (ifConditions) {
    const length = ifConditions.length
    for (let i = 1; i < length; i++) {
      mpmlAst.ifConditions[i].block = convertAst(ifConditions[i].block, options, util, conventRule)
    }
  }

  return mpmlAst
}

export default function getAstCommon (compiled, options = {}, log, conventRule) {
  const { ast } = compiled
  const deps = {
    // slots: 'slots'
  }
  const slots = {
    // slotId: nodeAst
  }
  const slotTemplates = {
  }

  const wxast = convertAst(ast, options, { log, deps, slots, slotTemplates }, conventRule)
  const children = Object.keys(slotTemplates).map(k => convertAst(slotTemplates[k], options, { log, deps, slots, slotTemplates }, conventRule))
  wxast.children = children.concat(wxast.children)
  return {
    wxast,
    deps,
    slots
  }
}
