const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g
function strToRegExp (str) {
  return new RegExp(str.replace(matchOperatorsRe, '\\$&'))
}

// runtime
// fix mp env
const { App, Page, getApp, Component } = require('./mp.runtime')
global.App = App
global.Page = Page
global.getApp = getApp
global.Component = Component

const Vue = require('../../../packages/mpvue')

function createInstance (options) {
  return new Vue(options)
}

module.exports = {
  strToRegExp,
  createInstance
}
