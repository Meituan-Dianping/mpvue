const { createInstance } = require('../helpers/index')

// 通过最终的 setData 来确认数据
describe('instance', function () {
  const defOptions = {
    data () {
      return {
        msg: 233
      }
    },
    // render 由 mpvue-loader 和 mpvue-template-compiler 生成
    render () {
      var _vm = this
      var _h = _vm.$createElement
      var _c = _vm._self._c || _h
      return _c('div', {
        staticClass: 'container'
      }, [_c('p', [_vm._v(_vm._s(_vm.msg))])], 1)
    }
  }

  function getDefAppData () {
    return {
      $root: {
        0: {
          msg: 233,
          $k: '0',
          $kk: '0,',
          $p: ''
        }
      }
    }
  }

  function getDefAppDataByVfor () {
    return {
      $root: {
        0: {
          items: [111, 222, 333],
          $k: '0',
          $kk: '0,',
          $p: ''
        },
        '0,1-0': {
          info: 111,
          $k: '0,1-0',
          $kk: '0,1-0,',
          $p: '0'
        },
        '0,1-1': {
          info: 222,
          $k: '0,1-1',
          $kk: '0,1-1,',
          $p: '0'
        },
        '0,1-2': {
          info: 333,
          $k: '0,1-2',
          $kk: '0,1-2,',
          $p: '0'
        }
      }
    }
  }

  // data 默认初始化数据
  it('data', function (done) {
    const app = createInstance(Object.assign({}, defOptions))
    app.$mount()

    setTimeout(function () {
      const appData = getDefAppData()
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })

  // 响应式数据 eg. setTimeout
  it('Reactivity data', function (done) {
    const options = Object.assign({
      created () {
        setTimeout(() => {
          this.msg = 666
        }, 20)
      }
    }, defOptions)
    const app = createInstance(options)
    app.$mount()

    setTimeout(function () {
      const appData = getDefAppData()
      appData['$root']['0']['msg'] = 666
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })

  // this.$nextTick
  it('this.$nextTick', function (done) {
    const options = Object.assign({
      created () {
        this.$nextTick(() => {
          this.msg = 777
        }, 20)
      }
    }, defOptions)
    const app = createInstance(options)
    app.$mount()

    setTimeout(function () {
      const appData = getDefAppData()
      appData['$root']['0']['msg'] = 777
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })

  // computed 计算属性
  it('computed', function (done) {
    const options = Object.assign({
      computed: {
        message () {
          return this.msg + '!!!'
        }
      }
    }, defOptions)
    const app = createInstance(options)
    app.$mount()

    setTimeout(function () {
      const appData = getDefAppData()
      appData['$root']['0']['message'] = '233!!!'
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })

  // 组件
  it('props', function (done) {
    const cardOptions = {
      props: ['info'],
      // <div class="container">{{info}}</div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._v(_vm._s(_vm.info))])
      }
    }
    const options = {
      components: {
        card: cardOptions
      },
      data () {
        return {
          msg: 233
        }
      },
      // <div class="container">
      //   <card :info="msg"></card>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('card', {
          attrs: {
            'info': _vm.msg,
            'mpcomid': '0' // 这是 mpvue-loader 通过 mpvue-template-compiler 加上的
          }
        })], 1)
      }
    }
    const app = createInstance(options)
    app.$mount()

    setTimeout(function () {
      const appData = {
        $root: {
          0: {
            msg: 233,
            $k: '0',
            $kk: '0,',
            $p: ''
          },
          '0,0': {
            info: 233,
            $k: '0,0',
            $kk: '0,0,',
            $p: '0'
          }
        }
      }
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })

  // v-for 情况下的子组件作用域隔离
  it('v-for with props', function (done) {
    const cardOptions = {
      props: ['info'],
      // <div class="container">{{info}}</div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._v(_vm._s(_vm.info))])
      }
    }
    const options = {
      components: {
        card: cardOptions
      },
      data () {
        return {
          items: [111, 222, 333]
        }
      },
      // <div class="container">
      //     <card v-for="item in items" :info="item"></card>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._l((_vm.items), function (item, index) {
          return _c('card', {
            attrs: {
              'info': item,
              'mpcomid': '1-' + index
            }
          })
        })], 1)
      }
    }
    const app = createInstance(options)
    app.$mount()

    setTimeout(function () {
      const appData = getDefAppDataByVfor()
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })

  it('v-for with reactivity props', function (done) {
    const cardOptions = {
      props: ['info'],
      // <div class="container">{{info}}</div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._v(_vm._s(_vm.info))])
      }
    }
    const options = {
      components: {
        card: cardOptions
      },
      data () {
        return {
          items: [111, 222, 333]
        }
      },
      created () {
        this.items[1] = 'hello 222'
      },
      // <div class="container">
      //     <card v-for="item in items" :info="item"></card>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._l((_vm.items), function (item, index) {
          return _c('card', {
            attrs: {
              'info': item,
              'mpcomid': '1-' + index
            }
          })
        })], 1)
      }
    }
    const app = createInstance(options)
    app.$mount()

    setTimeout(function () {
      const appData = getDefAppDataByVfor()
      appData['$root']['0']['items']['1'] = 'hello 222'
      appData['$root']['0,1-1']['info'] = 'hello 222'
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })

  it('v-for with components data', function (done) {
    const cardOptions = {
      props: ['info'],
      data () {
        return {
          msg: 'hello card'
        }
      },
      created () {
        if (this.info === 222) {
          this.msg = 'hello card with 222'
        }
      },
      // <div class="container">{{info}}</div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._v(_vm._s(_vm.info))])
      }
    }
    const options = {
      components: {
        card: cardOptions
      },
      data () {
        return {
          items: [111, 222, 333]
        }
      },
      // <div class="container">
      //     <card v-for="item in items" :info="item"></card>
      // </div>
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._l((_vm.items), function (item, index) {
          return _c('card', {
            attrs: {
              'info': item,
              'mpcomid': '1-' + index
            }
          })
        })], 1)
      }
    }
    const app = createInstance(options)
    app.$mount()

    setTimeout(function () {
      const appData = getDefAppDataByVfor()
      appData['$root']['0,1-0']['msg'] = 'hello card'
      appData['$root']['0,1-1']['msg'] = 'hello card with 222'
      appData['$root']['0,1-2']['msg'] = 'hello card'
      expect(app.$mp.page.data).toEqual(appData)
      done()
    }, 300)
  })
})
