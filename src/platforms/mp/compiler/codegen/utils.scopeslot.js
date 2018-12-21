/**
 * 替换模板中的变量名为约定变量名
 * @param {string} alias 模板变量名
 * @param {string} aliasFull 约定变量名
 */
export const replaceVarSimple = (alias, aliasFull) => str =>
  str
    .replace(new RegExp(`^${alias}$`), aliasFull)
    .replace(new RegExp(`\\.${alias}\\.`, 'g'), `.${aliasFull}.`)
    .replace(new RegExp(`'${alias}'`, 'g'), `'${aliasFull}'`)
    .replace(new RegExp(`^${alias}\\.`), `${aliasFull}.`)
    .replace(new RegExp(`\\.${alias}$`), `.${aliasFull}`)
/**
 * 替换 astMap 属性中的变量名为约定变量名
 * @param {string} alias 模板变量名
 * @param {string} aliasFull 约定变量名
 */
const replaceSlotScopeVar = (alias, aliasFull) => str =>
  str
    .replace(new RegExp(`^${alias}$`), aliasFull)
    .replace(new RegExp(`^${alias}\\.`), `${aliasFull}.`)
/**
 * 替换 astMap 静态模板部分中的变量名为约定变量名
 * @param {string} alias 模板变量名
 * @param {string} aliasFull 约定变量名
 */
const replaceTemplateVar = (alias, aliasFull) => str => {
  const result = str
    .replace(new RegExp(`^\\(${alias}\\)`, 'g'), `(${aliasFull})`)
    .replace(new RegExp(`^\\(${alias}\\.`, 'g'), `(${aliasFull}.`)
  return result
}
/**
 * 使用替换参数创建一个用于生成{expression, text}的方法，简化调用
 * @param {string} target 模板变量名
 * @param {string} using 约定变量名
 * @returns { expression, text }
 */
const expressionReplacerFactory = (
  target,
  using = '$scopedata'
) => expression => {
  const arr = expression.split(/(\(.*?\))/g)
  const textArr = arr.slice()
  const replacer = replaceTemplateVar(target, using)
  const result = arr
    .map((str, idx) => {
      if (!/^\(.*?\)$/.test(str)) return
      const mainStr = replacer(str)
      textArr[idx] = `(\`${mainStr.slice(1, mainStr.length - 1)}\`)`
      return `${replacer(str)}`
    })
    .join('')
  let text = ''
  const _s = str => `{{ ${str} }}`
  try {
    text = eval(textArr.join('').replace(/\n/g, '\\n'))
  } catch (e) {
    console.info(_s(text), e)
  }
  return { expression: result, text }
}

/**
 * 替换当前节点属性、静态模板中使用的作用域变量，如果有
 * @param { astNode } nodeAst 节点词法树
 */
export const replaceVarStr = (nodeAst, options = {}) => {
  const { replaceTarget } = options
  if (!replaceTarget) return nodeAst
  const replacer = replaceSlotScopeVar(replaceTarget, '$scopedata')
  const expressionReplacer = expressionReplacerFactory(
    replaceTarget,
    '$scopedata'
  )
  const cache = {}
  let { attrs = [], attrsList = [] } = nodeAst
  const { attrsMap = {}} = nodeAst
  const getValueWithCache = oriValue => {
    let value
    if (cache[oriValue] !== undefined) {
      value = cache[oriValue]
    } else {
      value = replacer(oriValue)
      cache[oriValue] = value
    }
    return value
  }
  const mapFn = item => Object.assign({}, item, { value: getValueWithCache(item.value) })
  attrs = attrs.map(mapFn)
  attrsList = attrsList.map(mapFn)
  const newMap = {}
  Object.keys(attrsMap).forEach(key => {
    if (!key.startsWith(':')) return
    newMap[key] = getValueWithCache(attrsMap[key])
  })
  const newNode = Object.assign({}, nodeAst, { attrs, attrsList, attrsMap: newMap })
  // 替换静态内容
  if (newNode.expression) {
    const { expression, text } = expressionReplacer(newNode.expression)
    newNode.expression = expression
    newNode.text = text || newNode.text
  }
  return newNode
}
/**
 * 获取检查节点含有变量的绑定属性
 * @param {*} attrsList 节点属性列表
 */
export function getBindings (attrsList) {
  const bindingAttrs = []
  const bingAttr = /^(:|v-bind(:?))/
  attrsList.forEach(({ name, value }) => {
    if (bingAttr.test(name)) {
      const varName = name.replace(bingAttr, '')
      bindingAttrs.push({ name: varName, value })
    }
  })
  return bindingAttrs
}

/**
 * 递归查找for数据
 * @param {*} ast 节点
 */
export function getClosestFor (ast) {
  let target
  let currentAst = { parent: ast }
  while (currentAst.parent) {
    currentAst = currentAst.parent
    if (currentAst.for) {
      target = currentAst
      break
    }
  }
  return target
}
