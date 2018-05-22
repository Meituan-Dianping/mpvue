import wxmlAst from './convert/index'
import generate from './generate'
import utils from './utils'

export function compileToWxml (compiled, options = {}) {
  // TODO, compiled is undefined
  const { components = {}} = options
  const log = utils.log(compiled)

  const { wxast, deps = {}, slots = {}} = wxmlAst(compiled, options, log)
  let code = generate(wxast, options)

  // 引用子模版
  const importCode = Object.keys(deps).map(k => components[k] ? `<import src="${components[k].src}" />` : '').join('')
  code = `${importCode}<template name="${options.name}">${code}</template>`

  // 生成 slots code
  Object.keys(slots).forEach(k => {
    const slot = slots[k]
    let row = generate(slot.node, options)

    // slot中的表达式，即{{}}包裹的代码需要加上作用域
    slot.code = (row || '').split(splitExpressionReg).map(expression => {
      if (isExpressionReg.test(expression) && !/\$root/.test(expression)) {
        return handleExpression(expression, slot.depth)
      } else {
        return expression
      }
    }).join('')
  })

  // TODO: 后期优化掉这种暴力全部 import，虽然对性能没啥大影响
  return { code, compiled, slots, importCode }
}

const splitExpressionReg = /(\{\{.+?\}\})/
const isExpressionReg = /\{\{(.+?)\}\}/
const isStaticReg = /(^'.*'$)|(^".*"$)/
const splitStaticWordReg = /('.+?')|(".+?")/
const splitWordReg = /([\{\}\(\)\*\/\?\!\[\]\:\=\+\-><\s])/

function isVar (s) {
  return /^[a-zA-Z_$]/.test(s)
}

function isKeyWord (s) {
  return ['null', 'undefined', 'false', 'true'].indexOf(s) >= 0
}

// 处理表达式
function handleExpression (ex, depth) {
  return ex.split(splitStaticWordReg).map(m => {
    if (m && !isStaticReg.test(m)) {
      // 非静态字段
      return m.split(splitWordReg).map(s => {
        if (s && !isKeyWord(s) && isVar(s)) {
          s = setScope(s, depth)
        }
        return s
      }).join('')
    } else {
      return m
    }
  }).join('')
}

// 根据slot嵌套的深度设置其访问路径
function setScope(key, depth) {
  if (depth === 0) {
    return key
  } else if (depth === 1) {
    return `$root[$p].${key}`
  } else {
    let s = '$root[$p]'
    for (let i = 1; i < depth; i++) {
      s = '$root[' + s + '.$p]'
    }
    s += `.${key}`
    return s
  }
}
