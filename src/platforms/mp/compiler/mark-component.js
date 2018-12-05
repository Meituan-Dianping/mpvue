import convertTagMap from './codegen/config/wxmlTagMap'

function getWxEleId (index, iterators) {
  if (!iterators.length) {
    return `'${index}'`
  }
  return `'${index}-'+${iterators.join(`+'-'+`)}`
}

// 检查不允许在 v-for 的时候出现2个及其以上相同 iterator1
function checkRepeatIterator (iterators, options) {
  const len = iterators.length
  if (len > 1 && len !== new Set(iterators).size) {
    options.warn(`同一组件内嵌套的 v-for 不能连续使用相同的索引，目前为: ${iterators.join(',')}`, false)
  }
}

function addAttr (path, key, value, inVdom) {
  path[key] = value
  path.plain = false
  if (!inVdom) {
    path.attrsMap[`data-${key}`] = `{{${value}}}`
  }
  if (!path.attrs) {
    path.attrs = []
  }
  path.attrs.push({ name: key, value })
}

function mark (node, options, state, iterators = []) {
  if (node.type !== 1) {
    return
  }

  const currentIterators = iterators.slice()

  if (node.for && !node.iterator1) {
    node.iterator1 = `$index_${iterators.length}`
  }

  if (node.iterator1) {
    currentIterators.push(node.iterator1)
  }

  checkRepeatIterator(currentIterators, options)

  // 递归子节点
  if (node.children && node.children.length) {
    node.children.forEach(child => {
      mark(child, options, state, currentIterators)
    })
  }

  // fix: v-else events
  if (node.ifConditions && node.ifConditions.length > 1) {
    node.ifConditions.slice(1).forEach(condition => {
      mark(condition.block, options, state, currentIterators)
    })
  }

  // for mpvue-template-compiler
  // events || v-model
  const hasModel = node.directives && node.directives.find(v => v.name === 'model')
  const needEventsID = node.events || hasModel

  if (needEventsID) {
    const eventId = getWxEleId(state.eventIndex, currentIterators)
    addAttr(node, 'eventid', eventId)
    node.attrsMap['data-comkey'] = '{{$k}}'
    state.eventIndex += 1
  }

  // 子组件
  if (!node.tag || convertTagMap[node.tag]) {
    return
  }

  // eg. '1-'+i+'-'+j
  const value = getWxEleId(state.comIndex, currentIterators)
  addAttr(node, 'mpcomid', value, true)
  node.mpcomid = value
  state.comIndex += 1
}

// 全局的事件触发器 ID
export function markComponent (node, options) {
  if (node) {
    mark(node, options, { comIndex: 0, eventIndex: 0 })
  }
  return node
}
