import getMpmlAst from './convert/index'
import compileToMPMLCommon from '../common/generate'

export default function compileToMPML (compiled, options = {}) {
  return compileToMPMLCommon(compiled, options, getMpmlAst)
}

