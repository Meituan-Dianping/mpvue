import directiveMap from '../config/directiveMap'
import baseAttrs from '../../common/convert/attrs'

export default {
  format: baseAttrs.format,
  classObj: baseAttrs.classObj,
  styleObj: baseAttrs.styleObj,

  event (key, val, attrs, tag, log) {
    return baseAttrs.event.call(this, key, val, attrs, tag, log, directiveMap, 'tt')
  },

  convertAttr (ast, log) {
    return baseAttrs.convertAttr.call(this, ast, log, directiveMap, 'tt')
  },

  bind (key, val, attrs, tag, isIf) {
    return baseAttrs.bind.call(this, key, val, attrs, tag, isIf, 'tt')
  },

  model (key, val, attrs, tag) {
    return baseAttrs.model.call(this, key, val, attrs, tag, 'tt')
  }
}
