// 节流方法，性能优化
import { getComKey } from '../util/index'

//数据比较与克隆方法，用于数据节流
const { cloneModified, cloneData } = (function () {
  var toString = Object.prototype.toString;

  function isType(type, obj) {
    return toString.call(obj) === "[object " + type + "]"
  }

  /**
   * 复制对象
   * @param  {[type]} a [description]
   * @return {[type]}   [description]
   */
  function cloneData(a) {
    if (isType('Object', a)) {
      var ret = {};
      Object.keys(a).forEach(function (k) {
        if (k != '__ob__') {
          ret[k] = cloneData(a[k]);
        }
      });
      return ret;
    } else if (isType('Array', a)) {
      var ret = [];
      a.forEach(function (v, i) {
        ret[i] = cloneData(v);
      });
      return ret;
    } else {
      return a;
    }
  }

  /**
   * 复制变更的对象
   * @param  {[type]} a    [description]
   * @param  {[type]} b    [description]
   * @param  {[type]} res  [description]
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
   */
  function cloneModified(a, b, res, path, parent, parentKey) {
    var typeA = toString.call(a);
    //类型不一致，直接复制返回
    if (typeA != toString.call(b)) {
      res[path] = parent[parentKey] = cloneData(b);
      return res;
    }
    //"[object " + type + "]"
    var type = typeA.substring(8, typeA.length - 1);
    switch (type) {
      case 'Object':
        {
          var keysa = Object.keys(a);
          var keysb = Object.keys(b);
          var hasUnsetKeys = false;
          for (var k of keysa) {
            if (k == '__ob__') {
              continue;
            }
            if (!b.hasOwnProperty(k)) {
              hasUnsetKeys = true;
              break;
            }
          }
          //有删除的属性，复制完整对象
          if (hasUnsetKeys) {
            res[path] = parent[parentKey] = cloneData(b);
            return res;
          }
          //检查属性变更
          for (var k of keysb) {
            if (k == '__ob__') {
              continue;
            }
            res = cloneModified(a[k], b[k], res, joinPath(path, k), a, k);
          }
          return res;
        }
      case 'Array':
        {
          //删减数组，复制
          if (a.length > b.length) {
            res[path] = parent[parentKey] = cloneData(b);
            return res;
          }
          for (var i = 0, len = b.length; i < len; i++) {
            res = cloneModified(a[i], b[i], res, joinPath(path, i, true), a, i);
          }
          return res;
        }
      case 'Number':
        {
          //特殊情况 NaN!==NaN
          if (isNaN(a) && isNaN(b)) {
            return res;
          }
          break;
        }
    }
    if (a !== b) {
      res[path] = parent[parentKey] = b;
    }
    return res;
  }

  function joinPath(p, subp, isArr) {
    return isArr ? (p + '[' + subp + ']') : (p + '.' + subp.replace(/\./g, '\\.'));
  }
  return {
    cloneModified: cloneModified,
    cloneData: cloneData
  };
})();

// 全局的命名约定，为了节省编译的包大小一律采取形象的缩写，说明如下。
// $c === $child
// $k === $comKey

// 新型的被拍平的数据结构
// {
//   $root: {
//     '1-1'{
//       // ... data
//     },
//     '1.2-1': {
//       // ... data1
//     },
//     '1.2-2': {
//       // ... data2
//     }
//   }
// }

function getVmData (vm, extendVal, increments) {
  // 确保当前 vm 所有数据被同步
  const dataKeys = [].concat(
    Object.keys(vm._data || {}),
    Object.keys(vm._props || {}),
    Object.keys(vm._mpProps || {}),
    Object.keys(vm._computedWatchers || {})
  )
  //最后变更数据
  var lastVmData = increments ? (vm._lastDatas || (vm._lastDatas = {})) : (vm._lastDatas = {});
  var res = {};
  res = filterData(res, dataKeys, vm, lastVmData);
  if (extendVal) {
    res = filterData(res, Object.keys(extendVal), extendVal, lastVmData);
  }
  return res;

  //过滤变更数据
  function filterData(res, keys, vals, lastVmData) {
    if (increments) {
      keys.reduce(function (res, key) {
        res = cloneModified(lastVmData[key], vals[key], res, key.replace(/\./g, '\\.'), lastVmData, key);
        return res;
      }, res);
    } else {
      keys.reduce(function (res, key) {
        res[key.replace(/\./g, '\\.')] = lastVmData[key] = cloneData(vals[key]);
        return res;
      }, res);
    }
    return res;
  }
}

function getParentComKey (vm, res = []) {
  const { $parent } = vm || {}
  if (!$parent) return res
  res.unshift(getComKey($parent))
  if ($parent.$parent) {
    return getParentComKey($parent, res)
  }
  return res
}

function formatVmData (vm, increments) {
  const $p = getParentComKey(vm).join(',')
  const $k = $p + ($p ? ',' : '') + getComKey(vm)

  // getVmData 这儿获取当前组件内的所有数据，包含 props、computed 的数据
  // 改动 vue.runtime 所获的的核心能力
  var data = getVmData(vm, { $k, $kk: `${$k},`, $p }, increments);
  var key = '$root.' + $k;
  var res = {};
  if (increments) {
    Object.keys(data).forEach(function (subKey) {
      var subVal = data[subKey];
      res[key + '.' + subKey] = (subVal === void 0) ? null : subVal;
    });
  } else {
    res[key] = data;
  }
  return res
}

function collectVmData(vm, res = {}) {
  const { $children: vms } = vm
  if (vms && vms.length) {
    vms.forEach(v => collectVmData(v, res))
  }
  return Object.assign(res, formatVmData(vm))
}

/**
 * 频率控制 返回函数连续调用时，func 执行频率限定为 次 / wait
 * 自动合并 data
 *
 * @param  {function}   func      传入函数
 * @param  {number}     wait      表示时间窗口的间隔
 * @param  {object}     options   如果想忽略开始边界上的调用，传入{leading: false}。
 *                                如果想忽略结尾边界上的调用，传入{trailing: false}
 * @return {function}             返回客户调用函数
 */
function throttle (func, wait, options) {
  let context, args, result
  let timeout = null
  // 上次执行时间点
  let previous = 0
  if (!options) options = {}
  // 延迟执行函数
  function later () {
    // 若设定了开始边界不执行选项，上次执行时间始终为0
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function (handle, data) {
    const now = Date.now()
    // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
    if (!previous && options.leading === false) previous = now
    // 延迟执行时间间隔
    const remaining = wait - (now - previous)
    context = this
    args = args ? [handle, Object.assign(args[1], data)] : [handle, data]
    // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
    // remaining大于时间窗口wait，表示客户端系统时间被调整过
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
      // 如果延迟执行不存在，且没有设定结尾边界不执行选项
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

// 优化频繁的 setData: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/performance/tips.html
const throttleSetData = throttle((handle, data) => {
  handle(data)
}, 50)

function getPage (vm) {
  const rootVueVM = vm.$root
  const { mpType = '', page } = rootVueVM.$mp || {}

  // 优化后台态页面进行 setData: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/performance/tips.html
  if (mpType === 'app' || !page || typeof page.setData !== 'function') {
    return
  }
  return page
}

// 优化每次 setData 都传递大量新数据
export function updateDataToMP () {
  const page = getPage(this)
  if (!page) {
    return
  }

  const data = formatVmData(this, true)
  throttleSetData(page.setData.bind(page), data)
}

export function initDataToMP () {
  const page = getPage(this)
  if (!page) {
    return
  }

  const data = collectVmData(this.$root)
  page.setData(data)
}
