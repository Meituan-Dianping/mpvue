import attrs from './attrs'
import component from '../../common/convert/component'
import convertFor from './for'
import getAstCommon from '../../common/convert/index'

export default function mpmlAst (compiled, options = {}, log) {
  const conventRule = { attrs, component, convertFor }
  return getAstCommon(compiled, options, log, conventRule)
}
