import utils from './utils'

const autoEndTags = [
  'progress',
  'checkbox',
  'switch',
  'input',
  'radio',
  'slider',
  'textarea'
]

function convertAttr (key, val) {
  return (val === '' || typeof val === 'undefined') ? key : `${key}="${val}"`
}

function generateCode (nodeAst, options = {}) {
  const { tag, attrsMap = {}, children = [], text, ifConditions = [] } = nodeAst
  if (!tag) {
    return text
  }
  // v-if 指令
  const ifConditionsArr = []
  if (ifConditions) {
    const length = ifConditions.length
    for (let i = 1; i < length; i++) {
      ifConditionsArr.push(generateCode(ifConditions[i].block, options))
    }
  }
  const childrenContent = children.map(childAst => generateCode(childAst, options)).join('')
  let attrs = Object.keys(attrsMap).map(key => convertAttr(key, attrsMap[key])).join(' ')
  attrs = attrs ? ` ${attrs}` : ''

  if (autoEndTags.indexOf(tag) > -1 && !childrenContent) {
    return `<${tag}${attrs} />${ifConditionsArr.join('')}`
  }
  return `<${tag}${attrs}>${childrenContent}</${tag}>${ifConditionsArr.join('')}`

  // if (autoEndTags.indexOf(tag) > -1 && !children.length) {
  //   return `<${tag}${attrs ? ' ' + attrs : ''} />${ifConditionsArr.join('')}`
  // }
  // return `<${tag}${attrs ? ' ' + attrs : ''}>${childrenContent}</${tag}>${ifConditionsArr.join('')}`
}


export default function compileToMPMLCommon (compiled, options = {}, getAst) {
  // TODO, compiled is undefined
  const { components = {}} = options
  const log = utils.log(compiled)

  const { wxast, deps = {}, slots = {}} = getAst(compiled, options, log)
  let code = generateCode(wxast, options)

  // 引用子模版
  const importCode = Object.keys(deps).map(k => components[k] ? `<import src="${components[k].src}" />` : '').join('')
  code = `${importCode}<template name="${options.name}">${code}</template>`

  // 生成 slots code
  Object.keys(slots).forEach(k => {
    const slot = slots[k]
    slot.code = generateCode(slot.node, options)
  })

  // TODO: 后期优化掉这种暴力全部 import，虽然对性能没啥大影响
  return { code, compiled, slots, importCode }
}

