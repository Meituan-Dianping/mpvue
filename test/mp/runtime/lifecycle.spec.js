const { createInstance } = require('../helpers/index')

// 生命周期
describe('init mpvue with lifecycle', function () {
  const onLifecycle = []

  function getComponentOptions (key = '') {
    return {
      // lifycycle for vue
      beforeCreate () {
        onLifecycle.push(`beforeCreate${key}`)
      },
      created () {
        onLifecycle.push(`created${key}`)
      },
      beforeMount () {
        onLifecycle.push(`beforeMount${key}`)
      },
      mounted () {
        onLifecycle.push(`mounted${key}`)
      },
      beforeUpdate () {
        onLifecycle.push(`beforeUpdate${key}`)
      },
      updated () {
        onLifecycle.push(`updated${key}`)
      },
      activated () {
        onLifecycle.push(`activated${key}`)
      },
      deactivated () {
        onLifecycle.push(`deactivated${key}`)
      },
      beforeDestroy () {
        onLifecycle.push(`beforeDestroy${key}`)
      },
      destroyed () {
        onLifecycle.push(`destroyed${key}`)
      },
      // lifycycle for wxmp
      onLaunch () {
        onLifecycle.push(`onLaunch${key}`)
      },
      onLoad () {
        onLifecycle.push(`onLoad${key}`)
      },
      onShow () {
        onLifecycle.push(`onShow${key}`)
      },
      onReady () {
        onLifecycle.push(`onReady${key}`)
      },
      onHide () {
        onLifecycle.push(`onHide${key}`)
      },
      onUnload () {
        onLifecycle.push(`unload${key}`)
      },
      onPullDownRefresh () {
        onLifecycle.push(`pullDownRefresh${key}`)
      },
      onReachBottom () {
        onLifecycle.push(`reachBottom${key}`)
      },
      onShareAppMessage () {
        onLifecycle.push(`shareAppMessage${key}`)
      },
      onPageScroll () {
        onLifecycle.push(`pageScroll${key}`)
      }
    }
  }

  beforeEach(function () {
    onLifecycle.length = 0
  })

  it('App', function () {
    const options = Object.assign(getComponentOptions(), {
      mpType: 'app'
    })
    const app = createInstance(options)
    app.$mount()
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLaunch', 'beforeMount', 'mounted', 'onShow'])
    expect(!!app.$mp.app).toEqual(true)
    expect(app.$mp.appOptions).toEqual({
      path: 'pages/index/index',
      scene: 1001,
      query: {}
    })
    expect(app.$mp.mpType).toEqual('app')
    expect(app.$mp.status).toEqual('show')
  })

  it('Page with render', function () {
    const options = Object.assign(getComponentOptions(), {
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [], 1)
      }
    })
    const app = createInstance(options)
    app.$mount()
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted'])
    expect(!!app.$mp.page).toEqual(true)
    expect(app.$mp.query).toEqual({})
    expect(app.$mp.appOptions).toEqual({
      path: 'pages/index/index',
      scene: 1001,
      query: {}
    })
    expect(app.$mp.mpType).toEqual('page')
    expect(app.$mp.status).toEqual('ready')
  })

  it('Page with components', function () {
    const warpOptions = Object.assign(getComponentOptions('-warp'), {
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_vm._v('warp component')], 1)
      }
    })
    const options = Object.assign(getComponentOptions(), {
      components: {
        warp: warpOptions
      },
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [_c('warp')], 1)
      }
    })
    const app = createInstance(options)
    app.$mount()

    expect(onLifecycle).toEqual([
      'beforeCreate',
      'created',
      'onLoad',
      'onShow',
      'onReady',
      'beforeMount',
      'beforeCreate-warp',
      'created-warp',
      'onLoad-warp',
      'onReady-warp',
      'beforeMount-warp',
      'mounted-warp',
      'mounted'
    ])
    expect(!!app.$mp.page).toEqual(true)
    expect(app.$mp.query).toEqual({})
    expect(app.$mp.mpType).toEqual('page')
    expect(app.$mp.status).toEqual('ready')
  })

  it('Page with leaveAndBack', function (done) {
    const options = Object.assign(getComponentOptions(), {
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [], 1)
      }
    })
    const app = createInstance(options)
    app.$mount()
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted'])
    expect(!!app.$mp.page).toEqual(true)
    expect(app.$mp.query).toEqual({})
    expect(app.$mp.mpType).toEqual('page')
    expect(app.$mp.status).toEqual('ready')

    app.$mp.page._leaveAndBack()
    expect(app.$mp.status).toEqual('hide')
    setTimeout(() => {
      expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted', 'onHide', 'onShow'])
      expect(app.$mp.status).toEqual('show')
      done()
    }, 200)
  })

  it('Page with customEvent', function () {
    const options = Object.assign(getComponentOptions(), {
      render () {
        var _vm = this
        var _h = _vm.$createElement
        var _c = _vm._self._c || _h
        return _c('div', {
          staticClass: 'container'
        }, [], 1)
      }
    })
    const app = createInstance(options)
    app.$mount()
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted'])
    expect(!!app.$mp.page).toEqual(true)
    expect(app.$mp.query).toEqual({})
    expect(app.$mp.mpType).toEqual('page')
    expect(app.$mp.status).toEqual('ready')

    app.$mp.page._callHook('onPullDownRefresh')
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted', 'pullDownRefresh'])

    app.$mp.page._callHook('onReachBottom')
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted', 'pullDownRefresh', 'reachBottom'])

    app.$mp.page._callHook('onShareAppMessage')
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted', 'pullDownRefresh', 'reachBottom', 'shareAppMessage'])

    app.$mp.page._callHook('onPageScroll')
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted', 'pullDownRefresh', 'reachBottom', 'shareAppMessage', 'pageScroll'])

    // onUnload
    app.$mp.page._callHook('onUnload')
    expect(app.$mp.status).toEqual('unload')
    expect(onLifecycle).toEqual(['beforeCreate', 'created', 'onLoad', 'onShow', 'onReady', 'beforeMount', 'mounted', 'pullDownRefresh', 'reachBottom', 'shareAppMessage', 'pageScroll', 'unload'])
  })
})
