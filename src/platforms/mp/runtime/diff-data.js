function depolyRootData (rootKey, data, vmProps) {
  Object.keys(vmProps).forEach((_key) => {
    if (_key === '__keyPath') { return }
    if (vmProps[_key] instanceof Object) { return }
    data[rootKey + '.' + _key] = vmProps[_key]
  })
  delete data[rootKey]
}

function depolyArrayData (rootKey, originKey, vmData, data, vm) {
  for (var i = 0; i < vmData.length; i++) {
    if (vmData[i] instanceof Object) {
           // 引用类型 递归
      minifyDeepData(rootKey + '.' + originKey + '[' + i + ']', null, vmData[i], data, null, null, vm)
    } else {
      data[rootKey + '.' + originKey + '[' + i + ']'] = vmData[i]
    }
  }
}

function minifyDeepData (rootKey, originKey, vmData, data, root, _mpValueSet, vm) {
  try {
    if (vmData instanceof Array) {
       // 数组
      let ArrayNeedDeploy = false
      vmData.forEach((item) => {
        if (item instanceof Object) {
          ArrayNeedDeploy = true
          return
        }
      })
      if (ArrayNeedDeploy) {
        depolyArrayData(rootKey, originKey, vmData, data, vm)
      } else {
      // 全是值类型的 保持root.0.list = [2,2]格式setData
        data[rootKey + '.' + originKey] = vmData
      }
    } else {
      // Object
      let __keyPathOnThis = [] // 存储这层对象的keyPath
      if (vmData.__keyPath) {
        // 有更新列表 ，按照更新列表更新
        __keyPathOnThis = vmData.__keyPath
        if (root) {
          // 根数据节点，有更新列表情况下，删除原来的大JSONObject属性，改用扁平赋值
          delete data[rootKey][originKey]
        }
      // 根节点可能有父子引用同一个引用类型数据，依赖树都遍历完后清理
        vm['__mpKeyPath'] = vm['__mpKeyPath'] || {}
        vm['__mpKeyPath'][vmData.__ob__.dep.id] = vmData
      } else {
        // 没有更新列表
        if (root && _mpValueSet === 'done') {
          // 设置过值的 没更新列表，从data中去除
          delete data[rootKey][originKey]
          return
        } else {
          return
        }
      }
      Object.keys(vmData).forEach((_key) => {
        if (vmData[_key] instanceof Object) {
          // 引用类型 递归
          if (_key === '__keyPath') {
            return
          }
          minifyDeepData(rootKey + '.' + originKey, _key, vmData[_key], data, null, null, vm)
        } else {
          // 更新列表中的 加入data
          __keyPathOnThis.forEach((item) => {
            if (item.key === _key) {
              if (originKey) {
                data[rootKey + '.' + originKey + '.' + _key] = vmData[_key]
              } else {
                data[rootKey + '.' + _key] = vmData[_key]
              }
            }
          })
        }
      })
    }
  } catch (e) {
    console.log(e, rootKey, originKey, vmData, data, root)
  }
}

function cleanKeyPath (vm) {
  if (vm.__mpKeyPath) {
    Object.keys(vm.__mpKeyPath).forEach((_key) => {
      delete vm.__mpKeyPath[_key]['__keyPath']
    })
  }
}

function getRootKey (vm, rootKey) {
  if (!vm.$parent.$attrs) {
    rootKey = '$root.0' + ',' + rootKey
    return rootKey
  } else {
    rootKey = vm.$parent.$attrs.mpcomid + ',' + rootKey
    return getRootKey(vm.$parent, rootKey)
  }
}

export function diffData (vm, data) {
  if (vm._mpValueSet === 'setDataReady') {
    vm._mpValueSet = 'done'
    vm.$nextTick(() => {
      cleanKeyPath(vm)
    })
  }
  const vmData = vm._data || {}
  const vmProps = vm._props || {}
  let rootKey = ''
  if (!vm.$attrs) {
    rootKey = '$root.0'
  } else {
    rootKey = getRootKey(vm, vm.$attrs.mpcomid)
  }
  // console.log(rootKey)

    // 值类型变量不考虑优化，还是直接更新
  const _onDataKeyPath = vmData.__keyPath || vm.__keyPath || []
  delete vm.__keyPath
  delete vmData.__keyPath
  delete vmProps.__keyPath
  if (vm._mpValueSet === 'done') {
    // 第二次赋值才进行缩减操作
    Object.keys(vmData).forEach((vmDataItemKey) => {
      if (vmData[vmDataItemKey] instanceof Object) {
          // 引用类型
        if (vmDataItemKey === '__keyPath') { return }
        minifyDeepData(rootKey, vmDataItemKey, vmData[vmDataItemKey], data, true, vm._mpValueSet, vm)
      } else {
          // _data上的值属性只有要更新的时候才赋值
        _onDataKeyPath.forEach((item) => {
          if (item.key === vmDataItemKey) {
            data[rootKey + '.' + vmDataItemKey] = vmData[vmDataItemKey]
          }
        })
      }
    })

    Object.keys(vmProps).forEach((vmPropsItemKey) => {
      if (vmProps[vmPropsItemKey] instanceof Object) {
        // 引用类型
        if (vmPropsItemKey === '__keyPath') { return }
        minifyDeepData(rootKey, vmPropsItemKey, vmProps[vmPropsItemKey], data, true, vm._mpValueSet, vm)
      }
      // _props上的值属性只有要更新的时候才赋值
    })
      // 更新的时候要平铺$root.0:{},否则会覆盖原正确数据
    depolyRootData(rootKey, data, vmProps)
  }
  if (vm._mpValueSet === undefined) {
      // 第一次设置数据成功后，标记位置true,再更新到这个节点如果没有keyPath数组认为不需要更新
    vm._mpValueSet = 'done'
  } else if (vm._mpValueSet === 'done') {
    vm._mpValueSet = 'setDataReady'
  }
  console.log(vm)
  console.log(data)
}
