export default function generate (obj, options = {}) {
  const { tag, attrsMap = {}, children, text, ifConditions } = obj
  if (!tag) return text
  let child = ''
  if (children && children.length) {
    // 递归子节点
    child = children.map(v => generate(v, options)).join('')
  }

  // v-if 指令
  const ifConditionsArr = []
  if (ifConditions) {
    const length = ifConditions.length
    for (let i = 1; i < length; i++) {
      ifConditionsArr.push(generate(ifConditions[i].block, options))
    }
  }

  const attrs = Object.keys(attrsMap).map(k => convertAttr(k, attrsMap[k])).join(' ')

  const tags = ['progress', 'checkbox', 'switch', 'input', 'radio', 'slider', 'textarea']
  if (tags.indexOf(tag) > -1) {
    return `<${tag}${attrs ? ' ' + attrs : ''} />${ifConditionsArr.join('')}`
  }
  return `<${tag}${attrs ? ' ' + attrs : ''}>${child || ''}</${tag}>${ifConditionsArr.join('')}`
}

function convertAttr (key, val) {
  return (val === '' || typeof val === 'undefined') ? key : `${key}="${val}"`
}
