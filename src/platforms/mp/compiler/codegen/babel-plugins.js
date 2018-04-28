// babel-plugin-transform-object-to-ternary-operator.js

import * as t from 'babel-types'
import generate from 'babel-generator'
import template from 'babel-template'
import { hyphenate } from 'shared/util'

function getStrByNode (node, onlyStr = false) {
  if (onlyStr) {
    return node.value || node.name || ''
  }
  return node.type === 'StringLiteral' ? node : t.stringLiteral(node.name || '')
}

// 把 { key: value } 转换成 [ value ? 'key' : '' ]
const objectVisitor = {
  ObjectExpression: function (path) {
    const elements = path.node.properties.map(propertyItem => {
      return t.conditionalExpression(propertyItem.value, getStrByNode(propertyItem.key), t.stringLiteral(''))
    })
    path.replaceWith(t.arrayExpression(elements))
  }
}

export function transformObjectToTernaryOperator (babel) {
  return { visitor: objectVisitor }
}

// 把 { key: value } 转换成 'key:' + value + ';'
const objectToStringVisitor = {
  ObjectExpression: function (path) {
    const expression = path.node.properties.map(propertyItem => {
      const keyStr = getStrByNode(propertyItem.key, true)
      const key = keyStr ? hyphenate(keyStr) : keyStr
      const { code: val } = generate(t.ExpressionStatement(propertyItem.value))
      return `'${key}:' + (${val.slice(0, -1)}) + ';'`
    }).join('+')

    const p = template(expression)({})
    path.replaceWith(p.expression)
  }
}
export function transformObjectToString (babel) {
  return { visitor: objectToStringVisitor }
}
