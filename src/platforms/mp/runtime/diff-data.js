import Vue from 'core/index'
import { diffLog } from './runtime-trace'
import { def } from 'core/util/index'

const KEY_SEP = '_'

function getDeepData (keyList, viewData) {
  if (keyList.length > 1) {
    const _key = keyList.splice(0, 1)
    const _viewData = viewData[_key]
    if (_viewData) {
      return getDeepData(keyList, _viewData)
    } else {
      return null
    }
  } else {
    if (viewData[keyList[0]]) {
      return viewData[keyList[0]]
    } else {
      return null
    }
  }
}

function deepDiff (oldData, newData, data, key) {
  if (oldData === newData) {
    return
  }
  // 新旧数据如果存在值为null则添加到需要更新的表中
  if (oldData === null || newData === null) {
    data[key] = newData
    return
  }
  if (Object.prototype.toString.call(oldData) !== Object.prototype.toString.call(newData)) {
    data[key] = newData
    return
  }
  // 如果新旧数据均为数组，则进行diff
  if (Array.isArray(newData) && Array.isArray(oldData)) {
    if (newData.length === oldData.length) {
      for (let i = 0, len = newData.length; i < len; i++) {
        // 递归处理，处理数据中包含数据或者包含对象的情况
        deepDiff(oldData[i], newData[i], data, key + '[' + i + ']')
      }
    } else {
      // 数组长度不一样直接setData
      data[key] = newData
    }
    return
  }
  // 如果新旧数据均为对象，进行diff
  if (typeof oldData === 'object' && typeof newData === 'object') {
    var newKeys = Object.keys(newData)
    var oldKeys = Object.keys(oldData)
    var uniqueKeys = new Set([...newKeys, ...oldKeys])
    uniqueKeys.forEach(itemKey => {
      if (oldData[itemKey] &&
        newData[itemKey] &&
        typeof newData[itemKey] === 'object' &&
        Object.prototype.toString.call(oldData) === Object.prototype.toString.call(newData)
      ) {
        deepDiff(oldData[itemKey], newData[itemKey], data, key + '.' + itemKey)
        return
      }
      if (oldData[itemKey] !== newData[itemKey]) {
        data[key + '.' + itemKey] = newData[itemKey]
      }
    })
    return
  }
  if (oldData !== newData) {
    data[key] = newData
  }
}

function compareAndSetDeepData (key, newData, vm, data) {
  // 比较引用类型数据
  try {
    const keyList = key.split('.')
    // page.__viewData__老版小程序不存在，使用mpvue里绑的data比对
    const oldData = getDeepData(keyList, vm.$root.$mp.page.data)
    if (!oldData) {
      data[key] = newData
      return
    }
    deepDiff(oldData, newData, data, key)
  } catch (e) {
    console.log(e, key, newData, vm)
  }
}

function cleanKeyPath (vm) {
  if (vm.__mpKeyPath) {
    Object.keys(vm.__mpKeyPath).forEach((_key) => {
      delete vm.__mpKeyPath[_key]['__keyPath']
    })
  }
}

function minifyDeepData (rootKey, originKey, vmData, data, _mpValueSet, vm) {
  try {
    if (vmData instanceof Array) {
       // 数组
      compareAndSetDeepData(rootKey + '.' + originKey, vmData, vm, data)
    } else {
      // Object
      let __keyPathOnThis = {} // 存储这层对象的keyPath
      if (vmData.__keyPath && !vmData.__newReference) {
        // 有更新列表 ，按照更新列表更新
        __keyPathOnThis = vmData.__keyPath
        Object.keys(vmData).forEach((_key) => {
          if (vmData[_key] instanceof Object) {
            // 引用类型 递归
            if (_key === '__keyPath') {
              return
            }
            minifyDeepData(rootKey + '.' + originKey, _key, vmData[_key], data, null, vm)
          } else {
            // 更新列表中的 加入data
            if (__keyPathOnThis[_key] === true) {
              if (originKey) {
                data[rootKey + '.' + originKey + '.' + _key] = vmData[_key]
              } else {
                data[rootKey + '.' + _key] = vmData[_key]
              }
            }
          }
        })
         // 根节点可能有父子引用同一个引用类型数据，依赖树都遍历完后清理
        vm['__mpKeyPath'] = vm['__mpKeyPath'] || {}
        vm['__mpKeyPath'][vmData.__ob__.dep.id] = vmData
      } else {
        // 没有更新列表
        compareAndSetDeepData(rootKey + '.' + originKey, vmData, vm, data)
      }
      // 标记是否是通过this.Obj = {} 赋值印发的改动，解决少更新问题#1305
      def(vmData, '__newReference', false, false)
    }
  } catch (e) {
    console.log(e, rootKey, originKey, vmData, data)
  }
}

function getRootKey (vm, rootKey) {
  if (!vm.$parent.$attrs) {
    rootKey = '$root.0' + KEY_SEP + rootKey
    return rootKey
  } else {
    rootKey = vm.$parent.$attrs.mpcomid + KEY_SEP + rootKey
    return getRootKey(vm.$parent, rootKey)
  }
}

export function diffData (vm, data) {
  const vmData = vm._data || {}
  const vmProps = vm._props || {}
  let rootKey = ''
  if (!vm.$attrs) {
    rootKey = '$root.0'
  } else {
    rootKey = getRootKey(vm, vm.$attrs.mpcomid)
  }
  Vue.nextTick(() => {
    cleanKeyPath(vm)
  })
  // console.log(rootKey)

  // 值类型变量不考虑优化，还是直接更新
  const __keyPathOnThis = vmData.__keyPath || vm.__keyPath || {}
  delete vm.__keyPath
  delete vmData.__keyPath
  delete vmProps.__keyPath
  if (vm._mpValueSet === 'done') {
    // 第二次赋值才进行缩减操作
    Object.keys(vmData).forEach((vmDataItemKey) => {
      if (vmData[vmDataItemKey] instanceof Object) {
        // 引用类型
        minifyDeepData(rootKey, vmDataItemKey, vmData[vmDataItemKey], data, vm._mpValueSet, vm)
      } else if (vmData[vmDataItemKey] !== undefined) {
        // _data上的值属性只有要更新的时候才赋值
        if (__keyPathOnThis[vmDataItemKey] === true) {
          data[rootKey + '.' + vmDataItemKey] = vmData[vmDataItemKey]
        }
      }
    })

    Object.keys(vmProps).forEach((vmPropsItemKey) => {
      if (vmProps[vmPropsItemKey] instanceof Object) {
        // 引用类型
        minifyDeepData(rootKey, vmPropsItemKey, vmProps[vmPropsItemKey], data, vm._mpValueSet, vm)
      } else if (vmProps[vmPropsItemKey] !== undefined) {
        data[rootKey + '.' + vmPropsItemKey] = vmProps[vmPropsItemKey]
      }
      // _props上的值属性只有要更新的时候才赋值
    })

    // 检查完data和props,最后补上_mpProps & _computedWatchers
    const vmMpProps = vm._mpProps || {}
    const vmComputedWatchers = vm._computedWatchers || {}
    Object.keys(vmMpProps).forEach((mpItemKey) => {
      data[rootKey + '.' + mpItemKey] = vm[mpItemKey]
    })
    Object.keys(vmComputedWatchers).forEach((computedItemKey) => {
      data[rootKey + '.' + computedItemKey] = vm[computedItemKey]
    })
    // 更新的时候要删除$root.0:{},否则会覆盖原正确数据
    delete data[rootKey]
  }
  if (vm._mpValueSet === undefined) {
    // 第一次设置数据成功后，标记位置true,再更新到这个节点如果没有keyPath数组认为不需要更新
    vm._mpValueSet = 'done'
  }
  if (Vue.config._mpTrace) {
    // console.log('更新VM节点', vm)
    // console.log('实际传到Page.setData数据', data)
    diffLog(data)
  }
}
