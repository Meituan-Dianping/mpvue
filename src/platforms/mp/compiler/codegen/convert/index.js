import attrs from './attrs'
import tag from './tag'
import component from './component'
import convertFor from './for'
import tagConfig from '../config/config'
import { hyphenate } from 'shared/util'

function convertAst (node, options = {}, util) {
  const { children, ifConditions, staticClass = '', mpcomid } = node
  let { tag: tagName } = node
  const { log, deps, slots, slotTemplates } = util
  let wxmlAst = Object.assign({}, node)
  const { moduleId, components } = options
  wxmlAst.tag = tagName = tagName ? hyphenate(tagName) : tagName
  // 引入 import, isSlot 是使用 slot 的编译地方，意即 <slot></slot> 的地方
  const isSlot = tagName === 'slot'
  if (isSlot) {
    deps.slots = 'slots'
    // 把当前 slot 节点包裹 template
    const defSlot = Object.assign({}, wxmlAst)
    defSlot.tag = 'template'
    const templateName = `${defSlot.attrsMap.name || 'default'}`
    defSlot.attrsMap.name = templateName
    wxmlAst.children = []
    defSlot.parent = node.parent.parent
    slotTemplates[templateName] = defSlot
  }

  const currentIsComponent = component.isComponent(tagName, components)
  if (currentIsComponent) {
    deps[tagName] = tagName
  }

  if (moduleId && !currentIsComponent && tagConfig.virtualTag.indexOf(tagName) < 0) {
    wxmlAst.staticClass = staticClass ? `${moduleId} ${staticClass}`.replace(/\"/g, '') : moduleId
  } else {
    wxmlAst.staticClass = staticClass.replace(/\"/g, '')
  }

  // 组件内部的node节点全部是 slot
  wxmlAst.slots = {}
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
        const node = isDefault ? { tag: 'slot', attrsMap: {}, children: n } : n

        node.tag = 'template'
        node.attrsMap.name = slotId
        delete node.attrsMap.slot
        // 缓存，会集中生成一个 slots 文件
        slots[slotId] = { node: convertAst(node, options, util), name: slotName, slotId }
        wxmlAst.slots[slotName] = slotId
      })
    // 清理当前组件下的节点信息，因为 slot 都被转移了
    children.length = 0
    wxmlAst.children.length = 0
  }

  wxmlAst.attrsMap = attrs.format(wxmlAst.attrsMap)
  wxmlAst = tag(wxmlAst, options)
  wxmlAst = convertFor(wxmlAst, options)
  wxmlAst = attrs.convertAttr(wxmlAst, log)
  if (children && !isSlot) {
    wxmlAst.children = children.map((k) => convertAst(k, options, util))
  }

  if (ifConditions) {
    const length = ifConditions.length
    for (let i = 1; i < length; i++) {
      wxmlAst.ifConditions[i].block = convertAst(ifConditions[i].block, options, util)
    }
  }

  return wxmlAst
}

export default function wxmlAst (compiled, options = {}, log) {
  const { ast } = compiled
  const deps = {
    // slots: 'slots'
  }
  const slots = {
    // slotId: nodeAst
  }
  const slotTemplates = {
  }

  const wxast = convertAst(ast, options, { log, deps, slots, slotTemplates })
  const children = Object.keys(slotTemplates).map(k => convertAst(slotTemplates[k], options, { log, deps, slots, slotTemplates }))
  wxast.children = children.concat(wxast.children)
  return {
    wxast,
    deps,
    slots
  }
}
