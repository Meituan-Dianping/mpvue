// used by `/build/config.js`

exports.mpBanner = `// fix env
try {
  if (!global) global = {};
  global.process = global.process || {};
  global.process.env = global.process.env || {};

  global.initNativeConstructor = function (mpType) {
    if (mpType === 'app') {
      global.App = global.App || App
    } else if (mpType === 'component') {
      global.Component = global.Component || Component;
    } else {
      global.Page = global.Page || Page;
      global.getApp = global.getApp || getApp;
    }
  }
} catch (e) {}
`

// hack fix mp LIFECYCLE_HOOKS, used by `/build/config.js`
exports.mpLifecycleHooks = `'onLaunch',
  'onLoad',
  'onShow',
  'onReady',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
  'onPageScroll',
  'onTabItemTap',
  'attached',
  'ready',
  'moved',
  'detached'`
