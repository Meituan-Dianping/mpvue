function getSlotsName (obj) {
  if (!obj) {
    return ''
  }
  return Object.keys(obj).map(k => {
    return `$slot${k}:'${obj[k]}'`
  }).join(',')
}

export default {
  isComponent (tagName, components = {}) {
    return !!components[tagName]
  },
  convertComponent (ast, components, slotName) {
    const { attrsMap, tag, mpcomid, slots } = ast
    if (slotName) {
      attrsMap['data'] = `{{...$root[$p], $root}}`
      attrsMap['is'] = `{{${slotName}}}`
    } else {
      const slotsName = getSlotsName(slots)
      const restSlotsName = slotsName ? `, ${slotsName}` : ''
      attrsMap['data'] = `{{...$root[$kk+${mpcomid}], $root${restSlotsName}}}`
      attrsMap['is'] = components[tag].name
    }
    return ast
  }
}
