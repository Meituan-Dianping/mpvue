import baseComponent from '../../common/convert/component'

export default {
  isComponent: baseComponent.isComponent,
  convertComponent (ast, components, slotName) {
    const newAst = baseComponent.convertComponent(ast, components, slotName)
    // 模板数据传递差异处理
    // 其它小程序格式：'{{...$root[$k], $root}}'
    // 百度小程序格式：'{{{...$root[$k], $root}}}'
    newAst.attrsMap['data'] = `{${newAst.attrsMap['data']}}`
    return newAst
  }
}
