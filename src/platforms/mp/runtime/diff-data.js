function depolyRootData (rootKey, data) {
  Object.keys(data[rootKey]).forEach((_key) => {
    if (_key === '__keyPath') { return }
    if (data[rootKey][_key] instanceof Array) { return }
    data[rootKey + '.' + _key] = data[rootKey][_key]
  })
  delete data[rootKey]
}

function depolyArrayData (rootKey, originKey, vmData, data) {
  for (var i = 0; i < vmData.length; i++) {
    if (vmData[i] instanceof Object) {
           // 引用类型 递归
      minifyDeepData(rootKey + '.' + originKey + '[' + i + ']', null, vmData[i], data)
    } else {
      data[rootKey + '.' + originKey + '[' + i + ']'] = vmData[i]
    }
  }
}

function minifyDeepData (rootKey, originKey, vmData, data, root, _mpValueSet) {
  if (vmData instanceof Array) {
       // 数组
    depolyArrayData(rootKey, originKey, vmData, data)
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
      // 根节点可能有父子引用同一个引用类型数据，检查清理__keyPath
      vmData.__keyPath
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
        minifyDeepData(rootKey + '.' + originKey, _key, vmData[_key], data)
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
}

export function diffData (vm, data) {
  const vmData = vm._data || {}
  const vmProps = vm._props || {}
  let rootKey = '$root.0'
  if (vm.$attrs && vm.$attrs.mpcomid) {
    rootKey = rootKey + ',' + vm.$attrs.mpcomid
  }
    // 值类型变量不考虑优化，还是直接更新
  vm.__keyPath = null
  vmData.__keyPath = null
  vmProps.__keyPath = null
  if (vm._mpValueSet === 'done') {
    // 第二次赋值才进行缩减操作
    Object.keys(vmData).forEach((vmDataItemKey) => {
      if (vmData[vmDataItemKey] instanceof Object) {
        // 引用类型
        if (vmDataItemKey === '__keyPath') { return }
        minifyDeepData(rootKey, vmDataItemKey, vmData[vmDataItemKey], data, true, vm._mpValueSet)
      }
    })
    Object.keys(vmProps).forEach((vmPropsItemKey) => {
      if (vmProps[vmPropsItemKey] instanceof Object) {
        // 引用类型
        if (vmPropsItemKey === '__keyPath') { return }
        minifyDeepData(rootKey, vmPropsItemKey, vmProps[vmPropsItemKey], data, true, vm._mpValueSet)
      }
    })
      // 更新的时候要平铺$root.0:{},否则会覆盖原正确数据
    depolyRootData(rootKey, data)
  }
  if (vm._mpValueSet === undefined) {
      // 第一次设置数据成功后，标记位置true,再更新到这个节点如果没有keyPath数组认为不需要更新
    vm._mpValueSet = 'done'
  }
  console.log(vm)
  console.log(data)
}
