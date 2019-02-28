import { COMKEY_SEP } from '../../../util/index'
function getSlotsName (obj) {
  if (!obj) {
    return ''
  }
  // wxml模板中 data="{{ a:{a1:'string2'}, b:'string'}}" 键a不能放在最后，会出错
  return tmplateSlotsObj(obj)
    .concat(
      Object.keys(obj).map(k => `$slot${k}:'${obj[k]}'`)
    )
    .join(',')
}

function tmplateSlotsObj (obj) {
  if (!obj) {
    return []
  }
  // wxml模板中 data="{{ a:{a1:'string2'}, b:'string'}}" 键a1不能写成 'a1' 带引号的形式，会出错
  const $for = Object.keys(obj)
    .map(k => `${k}:'${obj[k]}'`)
    .join(',')
  return $for ? [`$for:{${$for}}`] : []
}

export default {
  isComponent (tagName, components = {}) {
    return !!components[tagName]
  },
  convertComponent (ast, components, slotName) {
    const { attrsMap, tag, mpcomid, slots } = ast
    let dataAttr, isAttr
    if (slotName) {
      dataAttr = '{{...$root[$k], $root}}'
      // bindedName is available when rendering slot in v-for
      const bindedName = attrsMap['v-bind:name']
      if (bindedName) {
        isAttr = `{{$for[${bindedName}]}}`
      } else {
        isAttr = `{{${slotName}}}`
      }
    } else {
      const slotsName = getSlotsName(slots)
      const restSlotsName = slotsName ? `, ${slotsName}` : ''
      // mpcomid 处理： "'0'" 转换成："'_0'"
      const comId = `'${COMKEY_SEP + mpcomid.slice(1, -1)}'`
      dataAttr = `{{...$root[$k+${comId}], $root${restSlotsName}}}`
      isAttr = components[tag].name
    }
    attrsMap['data'] = dataAttr
    attrsMap['is'] = isAttr
    return ast
  }
}
