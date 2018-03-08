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
    slot.code = generate(slot.node, options)
  })

  return { code, compiled, slots }
}
