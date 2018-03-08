import wxmlDirectiveMap from '../config/wxmlDirectiveMap'
import utils from '../utils'
import tagConfig from '../config/config'

export default {
  format (attrs = {}) {
    const obj = {}

    Object.keys(attrs).map((key) => {
      const val = attrs[key]
      obj[key.replace('@', 'v-on:').replace(/^:/, 'v-bind:')] = val
    })

    return obj
  },

  convertAttr (ast, log) {
    const { attrsMap = {}, tag, staticClass } = ast
    let attrs = {}
    const wxClass = this.styleObj(attrsMap['v-bind:class'], staticClass)
    wxClass.length ? attrsMap['class'] = wxClass : ''
    const wxStyle = this.styleObj(attrsMap['v-bind:style'], attrsMap['style'])
    wxStyle.length ? attrsMap['style'] = wxStyle : ''

    Object.keys(attrsMap).map(key => {
      const val = attrsMap[key]
      if (key === 'v-bind:class' || key === 'v-bind:style') {
        return
      }
      if (key === 'v-text') {
        ast.children.unshift({
          text: `{{${val}}}`,
          type: 3
        })
      } else if (key === 'v-show') {
        attrs['hidden'] = `{{!(${val})}}`
      } else if (/^v\-on\:/i.test(key)) {
        attrs = this.event(key, val, attrs, tag)
      } else if (/^v\-bind\:/i.test(key)) {
        attrs = this.bind(key, val, attrs, tag, attrsMap['wx:key'])
      } else if (/^v\-model/.test(key)) {
        attrs = this.model(key, val, attrs, tag, log)
      } else if (wxmlDirectiveMap[key]) {
        const { name = '', type, map = {}, check } = wxmlDirectiveMap[key] || {}
        if (!(check && !check(key, val, log)) && !(!name || typeof type !== 'number')) {
          // 见 ./wxmlDirectiveMap.js 注释
          if (type === 0) {
            attrs[name] = `{{${val}}}`
          }

          if (type === 1) {
            attrs[name] = undefined
          }

          if (type === 2) {
            attrs[name] = val
          }

          if (type === 3) {
            attrs[map[name] || name] = `{{${val}}}`
            return
          }
        }
      } else if (/^v\-/.test(key)) {
        log(`不支持此属性-> ${key}="${val}"`, 'waring')
      } else {
        if ((tagConfig.virtualTag.indexOf(tag) > -1) && (key === 'class' || key === 'data-mpcomid')) {
          if (key !== 'data-mpcomid') {
            log(`template 不支持此属性-> ${key}="${val}"`, 'waring')
          }
        } else {
          attrs[key] = val
        }
      }
    })
    ast.attrsMap = attrs
    return ast
  },

  event (key, val, attrs, tag) {
    // 小程序能力所致，bind 和 catch 事件同时绑定时候，只会触发 bind ,catch 不会被触发。
    // .stop 的使用会阻止冒泡，但是同时绑定了一个非冒泡事件，会导致该元素上的 catchEventName 失效！
    // .prevent 可以直接干掉，因为小程序里没有什么默认事件，比如submit并不会跳转页面
    // .capture 不能做，因为小程序没有捕获类型的事件
    // .self 没有可以判断的标识
    // .once 也不能做，因为小程序没有 removeEventListener, 虽然可以直接在 handleProxy 中处理，但非常的不优雅，违背了原意，暂不考虑
    const name = key.replace(/^v\-on\:/i, '').replace(/\.prevent/i, '')
    const [eventName, ...eventNameMap] = name.split('.')
    const { 'v-on': eventMap, check } = wxmlDirectiveMap

    if (check) {
      check(key, val)
    }
    let wxmlEventName = ''
    if (eventName === 'change' && (tag === 'input' || tag === 'textarea')) {
      wxmlEventName = 'blur'
    } else {
      wxmlEventName = eventMap.map[eventName]
    }

    wxmlEventName = (eventNameMap.includes('stop') ? 'catch' : 'bind') + (wxmlEventName || eventName)
    attrs[wxmlEventName] = 'handleProxy'

    return attrs
  },

  bind (key, val, attrs, tag, isIf) {
    const name = key.replace(/^v\-bind\:/i, '')

    if (isIf && name === 'key') {
      attrs['wx:key'] = val
    }

    if (tag === 'template') {
      return attrs
    }

    if (name === 'href') {
      attrs['url'] = `{{${val}}}`
    } else {
      attrs[name] = `{{${val}}}`
    }

    return attrs
  },

  styleObj (styleBinding = '', style) {
    let _styleBinding = styleBinding.replace(/[\{\}]/g, '').replace(' ', '').replace(/\n/g, '')
    _styleBinding = _styleBinding.split(',').map(v => {
      return v.replace(/([^,^:]+)\:([^,]+)/g, (v, $1, $2) => {
        const _$1 = utils.toLowerCase($1).replace(/^'|'$/g, '')
        return `{{(${$2})\? '${_$1}' \: ' '}}`
      })
    }).join(' ')
    if (_styleBinding.indexOf('{') === -1 && _styleBinding) {
      _styleBinding = `{{${_styleBinding}}}`
    }
    return `${style || ''} ${_styleBinding}`.trim()
  },

  model (key, val, attrs, tag) {
    const isFormInput = tag === 'input' || tag === 'textarea'
    attrs['value'] = `{{${val}}}`
    if (key === 'v-model.lazy') {
      if (isFormInput) {
        attrs['bindblur'] = 'handleProxy'
      } else {
        attrs['bindchange'] = 'handleProxy'
      }
    } else {
      if (isFormInput) {
        attrs['bindinput'] = 'handleProxy'
      } else {
        attrs['bindchange'] = 'handleProxy'
      }
    }

    return attrs
  }
}
