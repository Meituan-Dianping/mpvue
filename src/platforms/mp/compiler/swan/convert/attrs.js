import directiveMap from '../config/directiveMap'
import baseAttrs from '../../common/convert/attrs'

export default {
  format: baseAttrs.format,
  classObj: baseAttrs.classObj,
  styleObj: baseAttrs.styleObj,

  event (key, val, attrs, tag, log) {
    return baseAttrs.event.call(this, key, val, attrs, tag, log, directiveMap, 's')
  },

  convertAttr (ast, log) {
    return baseAttrs.convertAttr.call(this, ast, log, directiveMap, 's')
  },

  bind (key, val, attrs, tag, isIf) {
    const newAttrs = baseAttrs.bind.call(this, key, val, attrs, tag, isIf, 's')

    const name = key.replace(/^v\-bind\:/i, '')
    if (tag === 'scroll-view') {
      if (name === 'scroll-top' || name === 'scroll-left' || name === 'scroll-into-view') {
        newAttrs[name] = `{=${val}=}`
      }
    }

    if (tag === 'input' || tag === 'textarea' || tag === 'slider') {
      if (name === 'value') {
        newAttrs[name] = `{=${val}=}`
      }
    }

    if (tag === 'movable-view' && (name === 'x' || name === 'y')) {
      newAttrs[name] = `{=${val}=}`
    }

    return newAttrs
  },

  model (key, val, attrs, tag) {
    return baseAttrs.model.call(this, key, val, attrs, tag, 's')
  }
}
