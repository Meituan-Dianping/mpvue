import babel from 'babel-core'
import prettier from 'prettier'
import tagConfig from '../config'
import {
  transformObjectToTernaryOperator,
  transformObjectToString
} from '../babel-plugins'

function transformDynamicClass (staticClass = '', clsBinding) {
  const result = babel.transform(`!${clsBinding}`, { plugins: [transformObjectToTernaryOperator] })
  // 先实现功能，再优化代码
  // https://github.com/babel/babel/issues/7138
  const cls = prettier.format(result.code, { semi: false, singleQuote: true }).slice(1, -1).replace(/\n|\r/g, '')
  return `${staticClass} {{${cls}}}`
}

function transformDynamicStyle (staticStyle = '', styleBinding) {
  const result = babel.transform(`!${styleBinding}`, { plugins: [transformObjectToString] })
  const cls = prettier.format(result.code, { semi: false, singleQuote: true }).slice(1, -1).replace(/\n|\r/g, '')
  return `${staticStyle} {{${cls}}}`
}

export default {
  format (attrs = {}) {
    const obj = {}

    Object.keys(attrs).map((key) => {
      const val = attrs[key]
      obj[key.replace('@', 'v-on:').replace(/^:/, 'v-bind:')] = val
    })

    return obj
  },

  convertAttr (ast, log, directiveMap, prefix = 'wx') {
    const { attrsMap = {}, tag, staticClass } = ast

    const wxClass = this.classObj(attrsMap['v-bind:class'], staticClass)
    if (wxClass.length) {
      attrsMap['class'] = wxClass
    }
    const wxStyle = this.styleObj(attrsMap['v-bind:style'], attrsMap['style'])
    if (wxStyle.length) {
      attrsMap['style'] = wxStyle
    }

    let attrs = {}
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
      } else if (key === 'v-html') {
        ast.tag = 'rich-text'
        attrs['nodes'] = `{{${val}}}`
      } else if (key === 'v-show') {
        attrs['hidden'] = `{{!(${val})}}`
      } else if (/^v\-on\:/i.test(key)) {
        attrs = this.event(key, val, attrs, tag, log)
      } else if (/^v\-bind\:/i.test(key)) {
        attrs = this.bind(key, val, attrs, tag, attrsMap[`${prefix}:key`])
      } else if (/^v\-model/.test(key)) {
        attrs = this.model(key, val, attrs, tag, log)
      } else if (directiveMap[key]) {
        const { name = '', type, map = {}, check } = directiveMap[key] || {}
        if (!(check && !check(key, val, log)) && !(!name || typeof type !== 'number')) {
          // 见 ./directiveMap.js 注释
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
        if ((tagConfig.virtualTag.indexOf(tag) > -1) && (key === 'class' || key === 'style' || key === 'data-mpcomid')) {
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

  event (key, val, attrs, tag, log, directiveMap, prefix = 'wx') {
    // 小程序能力所致，bind 和 catch 事件同时绑定时候，只会触发 bind ,catch 不会被触发。
    // .stop 的使用会阻止冒泡，但是同时绑定了一个非冒泡事件，会导致该元素上的 catchEventName 失效！
    // .prevent 可以直接干掉，因为小程序里没有什么默认事件，比如submit并不会跳转页面
    // .capture 不能做，因为小程序没有捕获类型的事件
    // .self 没有可以判断的标识
    // .once 也不能做，因为小程序没有 removeEventListener, 虽然可以直接在 handleProxy 中处理，但非常的不优雅，违背了原意，暂不考虑
    const name = key.replace(/^v\-on\:/i, '').replace(/\.prevent/i, '')
    const [eventName, ...eventNameMap] = name.split('.')
    const { 'v-on': eventMap, check } = directiveMap
    const isMy = prefix === 'a'

    if (check) {
      check(key, val)
    }
    let mpEventName = ''
    if (eventName === 'change' && (tag === 'input' || tag === 'textarea')) {
      mpEventName = 'blur'
    } else {
      mpEventName = eventMap.map[eventName]
    }

    // a 为支付宝小程序
    let eventType = isMy ? 'on' : 'bind'
    const isStop = eventNameMap.includes('stop')
    if (eventNameMap.includes('capture')) {
      if (isMy) {
        log('支付宝小程序不支持事件捕获')
      } else {
        eventType = isStop ? 'capture-catch:' : 'capture-bind:'
      }
    } else if (isStop) {
      eventType = 'catch'
    }

    if (isMy) {
      mpEventName = eventType + (mpEventName || eventName).replace(/^\S/, letter => letter.toUpperCase())
    } else {
      mpEventName = eventType + (mpEventName || eventName)
    }

    attrs[mpEventName] = 'handleProxy'
    return attrs
  },

  bind (key, val, attrs, tag, isIf, prefix = 'wx') {
    const name = key.replace(/^v\-bind\:/i, '')

    if (isIf && name === 'key') {
      attrs[`${prefix}:key`] = val
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

  classObj (clsBinding = '', staticCls) {
    if (!clsBinding && !staticCls) {
      return ''
    }
    if (!clsBinding && staticCls) {
      return staticCls
    }

    return transformDynamicClass(staticCls, clsBinding)
  },

  styleObj (styleBinding = '', staticStyle) {
    if (!styleBinding && !staticStyle) {
      return ''
    }
    if (!styleBinding && staticStyle) {
      return staticStyle
    }

    return transformDynamicStyle(staticStyle, styleBinding)
  },

  model (key, val, attrs, tag, prefix = 'wx') {
    const isInput = tag === 'input' || tag === 'textarea'
    const isLazy = key === 'v-model.lazy'
    const isMy = prefix === 'a'

    let event
    if (isMy) {
      event = isInput ? (isLazy ? 'onBlur' : 'onInput') : 'onChange'
    } else {
      event = isInput ? (isLazy ? 'bindblur' : 'bindinput') : 'bindchange'
    }

    attrs[event] = 'handleProxy'
    attrs['value'] = `{{${val}}}`
    return attrs
  }
}
