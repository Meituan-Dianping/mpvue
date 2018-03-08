// 因为没办法直接跑小程序的开发者工具做测试，所以简单的模拟一下小程序 runtime ，满足我们需要的功能即可

function getObjByPath (obj = {}, path, op = '.') {
  if (!obj) return obj
  const arr = (path || '').split(op)

  return arr.reduce((res, k) => {
    if (k) {
      if (!res[k]) res[k] = {}
      res = res[k]
    }
    return res
  }, obj)
}

let appVM = null

class MPPage {
  constructor (config) {
    this.data = {}
    Object.assign(this, config)

    this._options = {
      path: 'pages/index/index',
      scene: 1001,
      query: {}
    }

    this._initLifecycle()
  }

  // 此处只做简单的对象参数模拟
  setData (obj) {
    if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') {
      return
    }
    this.data = this.data || {}
    Object.keys(obj).forEach(key => {
      const val = obj[key]
      Object.assign(getObjByPath(this.data, key), val)
    })
  }

  // _ 开头的方法和属性定义等，都不是小程序暴露的方法，是模拟出的私有方法，手动触发用
  _initLifecycle () {
    this._callHook('onLoad', this._options.query)
    this._callHook('onShow')
    this._callHook('onReady')
  }

  _callHook (hook, ev) {
    const handle = this[hook]
    if (typeof handle === 'function') {
      return handle.call(this, ev)
    }
  }

  _leaveAndBack () {
    this._callHook('onHide')
    setTimeout(() => {
      this._callHook('onShow')
    }, 100)
  }
}

class MPApp extends MPPage {
  // app 具有不一样的生命周期
  _initLifecycle () {
    this._callHook('onLaunch', this._options)
    this._callHook('onShow', this._options)
  }
}

function Page (config) {
  return new MPPage(config)
}

function App (config) {
  appVM = new MPApp(config)
  return appVM
}

function getApp () {
  return appVM
}

module.exports = {
  Page,
  App,
  getApp
}
