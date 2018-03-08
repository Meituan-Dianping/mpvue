const { createInstance } = require('../helpers/index')

// 事件触发
describe('events', function () {
  // 事件由 wxml 的 bingtap 发出
  // 单一组件
  it('handleProxy', function (done) {
    const options = {
      methods: {
        clickHandle (str, ev) {
          expect(str).toEqual('test click')
          expect(ev.target.id).toEqual('testEventId')
          done()
        }
      },
      // render 由 mpvue-loader 和 mpvue-template-compiler 生成
      // <div class="container">
      //   <p @click="clickHandle('test click', $event)">233</p>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('p', {
          attrs: {
            'eventid': '0'
          },
          on: {
            'click': function ($event) {
              _vm.clickHandle('test click', $event)
            }
          }
        }, [_vm._v('233')])], 1)
      }
    }
    const app = createInstance(options)
    app.$mount()

    // 模拟从 wxml 的触发
    const ev = JSON.parse(`{"type":"tap","timeStamp":4155,"target":{"id":"testEventId","offsetLeft":83,"offsetTop":100,"dataset":{"comkey":"0","eventid":"0"}},"currentTarget":{"id":"testEventId","offsetLeft":83,"offsetTop":100,"dataset":{"comkey":"0","eventid":"0"}},"detail":{"x":172,"y":114},"touches":[{"identifier":0,"pageX":172,"pageY":114,"clientX":172,"clientY":114}],"changedTouches":[{"identifier":0,"pageX":172,"pageY":114,"clientX":172,"clientY":114}]}`)
    app.$mp.page._callHook('handleProxy', ev)
  })

  it('onShareAppMessage', function (done) {
    const options = {
      onShareAppMessage (options) {
        expect(options.from).toEqual('button')
        return {
          path: '/pages/index/index'
        }
      },
      // render 由 mpvue-loader 和 mpvue-template-compiler 生成
      // <div class="container">
      //   <p @click="clickHandle('test click', $event)">233</p>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('p', {
          attrs: {
            'eventid': '0'
          },
          on: {
            'click': function ($event) {
              _vm.clickHandle('test click', $event)
            }
          }
        }, [_vm._v('233')])], 1)
      }
    }
    const app = createInstance(options)
    app.$mount()
    const ret = app.$mp.page._callHook('onShareAppMessage', {
      from: 'button'
    })
    expect(ret.path).toEqual('/pages/index/index')
    done()
  })

  // 包含子组件
  it('handleProxy with components', function (done) {
    const warpOptions = {
      methods: {
        clickHandle (str, ev) {
          expect(str).toEqual('warp component click')
          expect(ev.target.id).toEqual('testEventId2')
          done()
        }
      },
      // <div class="container">
      //   <p @click="clickHandle('warp component click', $event)">warp component</p>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('p', {
          attrs: {
            'eventid': '0'
          },
          on: {
            'click': function ($event) {
              _vm.clickHandle('warp component click', $event)
            }
          }
        }, [_vm._v('warp component')])], 1)
      }
    }
    const options = {
      components: {
        warp: warpOptions
      },
      methods: {
        clickHandle (str, ev) {
          expect(str).toEqual('test p click')
          expect(ev.target.id).toEqual('testEventId1')
          done()
        }
      },
      // render 由 mpvue-loader 和 mpvue-template-compiler 生成
      // <div class="container">
      //   <p @click="clickHandle('test p click', $event)">
      //     233
      //     <warp></warp>
      //   </p>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('p', {
          attrs: {
            'eventid': '0'
          },
          on: {
            'click': function ($event) {
              _vm.clickHandle('test p click', $event)
            }
          }
        }, [_vm._v('233')]), _c('warp')], 1)
      }
    }
    const app = createInstance(options)
    app.$mount()

    // 模拟从 wxml 的触发
    const ev1 = JSON.parse(`{"type":"tap","timeStamp":8938,"target":{"id":"testEventId1","offsetLeft":0,"offsetTop":100,"dataset":{"comkey":"0","eventid":"0"}},"currentTarget":{"id":"testEventId1","offsetLeft":0,"offsetTop":100,"dataset":{"comkey":"0","eventid":"0"}},"detail":{"x":186,"y":112},"touches":[{"identifier":0,"pageX":186,"pageY":112,"clientX":186,"clientY":112}],"changedTouches":[{"identifier":0,"pageX":186,"pageY":112,"clientX":186,"clientY":112}]}`)
    app.$mp.page._callHook('handleProxy', ev1)

    const ev2 = JSON.parse(`{"type":"tap","timeStamp":152060,"target":{"id":"testEventId2","offsetLeft":116,"offsetTop":286,"dataset":{"comkey":"0,0","eventid":"0"}},"currentTarget":{"id":"testEventId2","offsetLeft":116,"offsetTop":286,"dataset":{"comkey":"0,0","eventid":"0"}},"detail":{"x":215,"y":301},"touches":[{"identifier":0,"pageX":216,"pageY":301,"clientX":216,"clientY":301}],"changedTouches":[{"identifier":0,"pageX":216,"pageY":301,"clientX":216,"clientY":301}]}`)
    app.$mp.page._callHook('handleProxy', ev2)
  })

  // v-model 等特殊指令
  it('v-model', function (done) {
    const options = {
      data () {
        return {
          testInput: ''
        }
      },
      // render 由 mpvue-loader 和 mpvue-template-compiler 生成
      // <div class="container">
      //   <input v-model="testInput" />
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('input', {
          directives: [{
            name: 'model',
            rawName: 'v-model',
            value: (_vm.testInput),
            expression: 'testInput'
          }],
          attrs: {
            eventid: '0'
          },
          domProps: {
            value: (_vm.testInput)
          },
          on: {
            input: function ($event) {
              if ($event.target.composing) return
              _vm.testInput = $event.target.value
            }
          }
        })])
      }
    }
    const app = createInstance(options)
    app.$mount()

    // 模拟从 wxml 的触发
    const ev = JSON.parse(`{"type":"input","timestamp":1505102982041,"detail":{"value":"233","cursor":1},"target":{"id":"","dataset":{"comkey":"0","eventid":"0"},"offsetTop":100,"offsetLeft":83},"currentTarget":{"id":"","dataset":{"comkey":"0","eventid":"0"},"offsetTop":100,"offsetLeft":83},"touches":[]}`)
    app.$mp.page._callHook('handleProxy', ev)

    setTimeout(function () {
      const val = app.$mp.page.data['$root']['0']['testInput']
      expect(val).toEqual('233')
      done()
    }, 300)
  })

  // v-model 等特殊指令
  it('v-model.lazy', function (done) {
    const options = {
      data () {
        return {
          testInput: ''
        }
      },
      methods: {
        handle (ev) {
          expect(ev.target.value).toEqual('2222')
        }
      },
      // render 由 mpvue-loader 和 mpvue-template-compiler 生成
      // <div class="container">
      //   <input v-model.lazy="testInput" />
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('input', {
          directives: [{
            name: 'model',
            rawName: 'v-model.lazy',
            value: (_vm.testInput),
            expression: 'testInput',
            modifiers: {
              lazy: true
            }
          }],
          attrs: {
            eventid: '0'
          },
          domProps: {
            value: (_vm.testInput)
          },
          on: {
            change: [
              function ($event) {
                _vm.testInput = $event.target.value
              },
              _vm.handle
            ]
          }
        })])
      }
    }
    const app = createInstance(options)
    app.$mount()

    // 模拟从 wxml 的触发
    const ev = JSON.parse(`{"type":"blur","timeStamp":90596,"target":{"id":"","offsetLeft":83,"offsetTop":100,"dataset":{"comkey":"0","eventid":"0"}},"currentTarget":{"id":"","offsetLeft":83,"offsetTop":100,"dataset":{"comkey":"0","eventid":"0"}},"detail":{"value":"2222"}}`)
    app.$mp.page._callHook('handleProxy', ev)

    setTimeout(function () {
      const val = app.$mp.page.data['$root']['0']['testInput']
      expect(val).toEqual('2222')
      done()
    }, 300)
  })
})
