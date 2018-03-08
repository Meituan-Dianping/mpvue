const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g
function strToRegExp (str) {
  return new RegExp(str.replace(matchOperatorsRe, '\\$&'))
}

// runtime
// fix mp env
const { App, Page, getApp } = require('./mp.runtime')
global.App = App
global.Page = Page
global.getApp = getApp

const Vue = require('../../../packages/mpvue')

function createInstance (options) {
  return new Vue(options)
}

module.exports = {
  strToRegExp,
  createInstance
}
