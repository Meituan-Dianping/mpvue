import { replaceVarSimple } from '../utils.scopeslot'

function getSlotsName (obj) {
  if (!obj) {
    return ''
  }
  // wxml模板中 data="{{ a:{a1:'string2'}, b:'string'}}" 键a不能放在最后，会出错
  return tmplateSlotsObj(obj)
    .concat(
      Object.keys(obj).map(function(k) {
        return '$slot' + k + ":'" + obj[k] + "'"
      })
    )
    .join(',')
}

function tmplateSlotsObj(obj) {
  if (!obj) {
    return []
  }
  // wxml模板中 data="{{ a:{a1:'string2'}, b:'string'}}" 键a1不能写成 'a1' 带引号的形式，会出错
  const $for = Object.keys(obj)
    .map(function(k) {
      return `${k}:'${obj[k]}'`
    })
    .join(',')
  return $for ? [`$for:{${$for}}`] : []
}

export default {
  isComponent (tagName, components = {}) {
    return !!components[tagName]
  },
  convertComponent (ast, components, slotName) {
    const { attrsMap, tag, mpcomid, slots, attrsList } = ast
    if (slotName) {
      const { alias, for: forName, iterator1 } = ast.parent
      const hasFor = forName && alias
      // 有 v-for 的slot-scoped 在原有的 <template data=‘... 上增加作用域数据
      if (hasFor) {
        // scope-slot 情况
        const varRootStr = '$root[$k]'
        const aliasFull = `['${forName}'][${iterator1}]`
        let $scopeStr = '{ '
        const genKeyStr = replaceVarSimple(alias, aliasFull)
        attrsList.forEach(function ({ name, value }) {
          let bindTarget = false
          if (name.startsWith(':')) {
            bindTarget = name.slice(1)
          } else if (name.startsWith('v-bind')) {
            bindTarget = name.slice('v-bind'.length + 1)
          }
          if (bindTarget === false) return
          const pathStr = genKeyStr(value)
          // 区分取变量方式：$root[$k].data 或 $root[$k][idx]
          const varSep = pathStr[0] === '[' ? '' : '.'
          const bindValStr = varRootStr + varSep + pathStr + ' ,'
          if (bindTarget === '') {
            // v-bind="data" 情况
            $scopeStr += '...' + bindValStr
          } else {
            // v-bind:something="varible" 情况
            $scopeStr += bindTarget + ': ' + bindValStr
          }
        })
        $scopeStr = $scopeStr.replace(/,?$/, ' }')
        // 约定使用 '$scopedata' 为替换变量名
        attrsMap['data'] = `{{ ...$root[$p], ...$root[$k], $root, $scopedata: ${$scopeStr} }}`
      } else {
        attrsMap['data'] = '{{...$root[$p], ...$root[$k], $root}}'
      }
      // bindedName is available when rendering slot in v-for
      const bindedName = attrsMap['v-bind:name']
      if(bindedName) {
        attrsMap['is'] = "{{$for[" + bindedName + "]}}"
      } else {
        attrsMap['is'] = "{{" + slotName + "}}"
      }
    } else {
      const slotsName = getSlotsName(slots)
      const restSlotsName = slotsName ? `, ${slotsName}` : ''
      attrsMap['data'] = `{{...$root[$kk+${mpcomid}], $root${restSlotsName}}}`
      attrsMap['is'] = components[tag].name
    }
    return ast
  }
}
