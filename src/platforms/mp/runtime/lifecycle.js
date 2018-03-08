import { handleError } from '../../../core/util/index'

export function callHook (vm, hook, params) {
  const handlers = vm.$options[hook]

  let ret
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        ret = handlers[i].call(vm, params)
      } catch (e) {
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }

  // for child
  if (vm.$children.length) {
    vm.$children.forEach(v => callHook(v, hook, params))
  }

  return ret
}

// mpType 小程序实例的类型，可能的值是 'app', 'page'
// rootVueVM 是 vue 的根组件实例，子组件中访问 this.$root 可得
function getGlobalData (app, rootVueVM) {
  const mp = rootVueVM.$mp
  if (app && app.globalData) {
    mp.appOptions = app.globalData.appOptions
  }
}

export function initMP (mpType, next) {
  const rootVueVM = this.$root
  if (!rootVueVM.$mp) {
    rootVueVM.$mp = {}
  }

  const mp = rootVueVM.$mp

  // Please do not register multiple Pages
  // if (mp.registered) {
  if (mp.status) {
    // 处理子组件的小程序生命周期
    if (mpType === 'app') {
      callHook(this, 'onLaunch', mp.appOptions)
    } else {
      callHook(this, 'onLoad', mp.query)
      callHook(this, 'onReady')
    }
    return next()
  }
  // mp.registered = true

  mp.mpType = mpType
  mp.status = 'register'

  if (mpType === 'app') {
    global.App({
      // 页面的初始数据
      globalData: {
        appOptions: {}
      },

      handleProxy (e) {
        rootVueVM.$handleProxyWithVue(e)
      },

      // Do something initial when launch.
      onLaunch (options = {}) {
        mp.app = this
        mp.status = 'launch'
        this.globalData.appOptions = mp.appOptions = options

        callHook(rootVueVM, 'onLaunch')
        next()
      },

      // Do something when app show.
      onShow (options = {}) {
        mp.status = 'show'
        this.globalData.appOptions = mp.appOptions = options
        callHook(rootVueVM, 'onShow')
      },

      // Do something when app hide.
      onHide () {
        mp.status = 'hide'
        callHook(rootVueVM, 'onHide')
      },

      onError (err) {
        callHook(rootVueVM, 'onError', err)
      }
    })
  } else if (mpType === 'component') {
    const app = global.getApp()
    global.Component({
      // 页面的初始数据
      data: {
        $root: {}
      },
      methods: {
        handleProxy (e) {
          rootVueVM.$handleProxyWithVue(e)
        },
      },
      // mp lifecycle for vue
      // 组件生命周期函数，在组件实例进入页面节点树时执行，注意此时不能调用 setData
      created () {
        mp.status = 'created'
        mp.page = this
      },
      // 组件生命周期函数，在组件实例进入页面节点树时执行
      attached () {
        mp.status = 'attached'
        callHook(rootVueVM, 'attached')
      },
      // 组件生命周期函数，在组件布局完成后执行，此时可以获取节点信息（使用 SelectorQuery ）
      ready () {
        mp.status = 'ready'

        callHook(rootVueVM, 'onReady')
        next()

        // 只有页面需要 setData
        rootVueVM.$nextTick(() => {
          rootVueVM._initDataToMP()
        })
      },
      // 组件生命周期函数，在组件实例被移动到节点树另一个位置时执行
      moved () {
        callHook(rootVueVM, 'moved')
      },
      // 组件生命周期函数，在组件实例被从页面节点树移除时执行
      detached () {
        mp.status = 'detached'
        callHook(rootVueVM, 'detached')
      }
    })
  } else {
    const app = global.getApp()
    global.Page({
      // 页面的初始数据
      data: {
        $root: {}
      },

      handleProxy (e) {
        rootVueVM.$handleProxyWithVue(e)
      },

      // mp lifecycle for vue
      // 生命周期函数--监听页面加载
      onLoad (query) {
        mp.page = this
        mp.query = query
        mp.status = 'load'
        getGlobalData(app, rootVueVM)
        callHook(rootVueVM, 'onLoad')
      },

      // 生命周期函数--监听页面显示
      onShow () {
        mp.status = 'show'
        callHook(rootVueVM, 'onShow')
      },

      // 生命周期函数--监听页面初次渲染完成
      onReady () {
        mp.status = 'ready'

        callHook(rootVueVM, 'onReady')
        next()

        // 只有页面需要 setData
        rootVueVM.$nextTick(() => {
          rootVueVM._initDataToMP()
        })
      },

      // 生命周期函数--监听页面隐藏
      onHide () {
        mp.status = 'hide'
        callHook(rootVueVM, 'onHide')
      },

      // 生命周期函数--监听页面卸载
      onUnload () {
        mp.status = 'unload'
        callHook(rootVueVM, 'onUnload')
      },

      // 页面相关事件处理函数--监听用户下拉动作
      onPullDownRefresh () {
        callHook(rootVueVM, 'onPullDownRefresh')
      },

      // 页面上拉触底事件的处理函数
      onReachBottom () {
        callHook(rootVueVM, 'onReachBottom')
      },

      // 用户点击右上角分享
      onShareAppMessage (options) {
        return callHook(rootVueVM, 'onShareAppMessage', options)
      },

      // Do something when page scroll
      onPageScroll (options) {
        callHook(rootVueVM, 'onPageScroll', options)
      },

      // 当前是 tab 页时，点击 tab 时触发
      onTabItemTap (options) {
        callHook(rootVueVM, 'onTabItemTap', options)
      }
    })
  }
}
