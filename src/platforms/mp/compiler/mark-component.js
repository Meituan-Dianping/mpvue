import convertTagMap from './codegen/config/wxmlTagMap'

function maybeTag (tagName) {
  return convertTagMap[tagName]
}

function getWxEleId (index, arr) {
  if (!arr || !arr.length) {
    return `'${index}'`
  }

  const str = arr.join(`+'-'+`)
  return `'${index}-'+${str}`
}

// 检查不允许在 v-for 的时候出现2个及其以上相同 iterator1
function checkRepeatIterator (arr) {
  const len = arr.length
  if (len > 1 && len !== new Set(arr).size) {
    console.log('\n', '\x1b[31m', 'error: ', '嵌套的 v-for 不能连续使用相同的 iterator:', arr)
  }
}

function fixDefaultIterator (path) {
  const { for: forText, iterator1 } = path
  if (forText && !iterator1) {
    path.iterator1 = 'index'
  }
}

function addAttr (path, key, value, inVdom) {
  path[key] = value
  path.plain = false
  // path.attrsMap[key] = value
  if (!inVdom) {
    path.attrsMap[`data-${key}`] = `{{${value}}}`
  }

  // if (!path.attrsList) {
  //   path.attrsList = []
  // }
  // path.attrsList.push({ name: `':${key}'`, value })

  if (!path.attrs) {
    path.attrs = []
  }
  path.attrs.push({ name: key, value })
}

function mark (path, deps, iteratorArr = []) {
  fixDefaultIterator(path)

  const { tag, children, iterator1, events, directives, ifConditions } = path

  const currentArr = Object.assign([], iteratorArr)

  if (iterator1) {
    currentArr.push(iterator1)
  }

  checkRepeatIterator(currentArr)

  // 递归子节点
  if (children && children.length) {
    children.forEach((v, i) => {
      // const counterIterator = children.slice(0, i).filter(v => v.for).map(v => v.for + '.length').join(`+'-'+`)
      mark(v, deps, currentArr)
    })
  }

  // fix: v-else events
  if (ifConditions && ifConditions.length && !ifConditions._handled) {
    ifConditions._handled = true
    ifConditions.forEach((v, i) => {
      mark(v.block, deps, currentArr)
    })
  }

  // for mpvue-template-compiler
  // events || v-model
  const hasModel = directives && directives.find(v => v.name === 'model')
  const needEventsID = events || hasModel

  if (needEventsID) {
    const eventId = getWxEleId(deps.eventIndex, currentArr)
    // const eventId = getWxEleId(eIndex, currentArr)
    addAttr(path, 'eventid', eventId)
    path.attrsMap['data-comkey'] = '{{$k}}'
    deps.eventIndex += 1
    // eIndex += 1
  }

  // 子组件
  if (!tag || maybeTag(tag)) {
    return
  }

  // eg. '1-'+i+'-'+j
  const value = getWxEleId(deps.comIndex, currentArr)
  addAttr(path, 'mpcomid', value, true)
  path['mpcomid'] = value
  deps.comIndex += 1
}

// 全局的事件触发器 ID
// let eIndex = 0
export function markComponent (ast) {
  const deps = { comIndex: 0, eventIndex: 0 }
  mark(ast, deps)

  return ast
}
