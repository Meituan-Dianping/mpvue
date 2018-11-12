import Vue from 'core/index'
var updateDataTotal = 0 // 总共更新的数据量
export function diffLog (updateData) {
  updateData = JSON.stringify(updateData)
  if (!Vue._mpvueTraceTimer) {
    Vue._mpvueTraceTimer = setTimeout(function () {
      clearTimeout(Vue._mpvueTraceTimer)
      updateDataTotal = (updateDataTotal / 1024).toFixed(1)
      console.log('这次操作引发500ms内数据更新量:' + updateDataTotal + 'kb')
      Vue._mpvueTraceTimer = 0
      updateDataTotal = 0
    }, 500)
  } else if (Vue._mpvueTraceTimer) {
    updateData = updateData.replace(/[^\u0000-\u00ff]/g, 'aa') // 中文占2字节，中文替换成两个字母计算占用空间
    updateDataTotal += updateData.length
  }
}
