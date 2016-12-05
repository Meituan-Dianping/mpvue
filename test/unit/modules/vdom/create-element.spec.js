import Vue from 'vue'
import { createElement } from 'core/vdom/create-element'
import { createEmptyVNode } from 'core/vdom/vnode'
import { bind } from 'shared/util'

describe('create-element', () => {
  it('render vnode with basic reserved tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = bind(createElement, vm)
    const vnode = h('p', {})
    expect(vnode.tag).toBe('p')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with component using createElement', () => {
    const vm = new Vue({
      data: { message: 'hello world' },
      components: {
        'my-component': {
          props: ['msg']
        }
      }
    })
    const h = bind(createElement, vm)
    const vnode = h('my-component', { props: { msg: vm.message }})
    expect(vnode.tag).toMatch(/vue-component-[0-9]+/)
    expect(vnode.componentOptions.propsData).toEqual({ msg: vm.message })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with custom tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = bind(createElement, vm)
    const tag = 'custom-tag'
    const vnode = h(tag, {})
    expect(vnode.tag).toBe('custom-tag')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
    expect(vnode.componentOptions).toBeUndefined()
  })

  it('render empty vnode with falsy tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = bind(createElement, vm)
    const vnode = h(null, {})
    expect(vnode).toEqual(createEmptyVNode())
  })

  it('render vnode with not string tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = bind(createElement, vm)
    const vnode = h(Vue.extend({ // Component class
      props: ['msg']
    }), { props: { msg: vm.message }})
    expect(vnode.tag).toMatch(/vue-component-[0-9]+/)
    expect(vnode.componentOptions.propsData).toEqual({ msg: vm.message })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with createElement with children', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    const vnode = h('p', void 0, [h('br'), 'hello world', h('br')])
    expect(vnode.children[0].tag).toBe('br')
    expect(vnode.children[1].text).toBe('hello world')
    expect(vnode.children[2].tag).toBe('br')
  })

  it('render vnode with children, omitting data', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    const vnode = h('p', [h('br'), 'hello world', h('br')])
    expect(vnode.children[0].tag).toBe('br')
    expect(vnode.children[1].text).toBe('hello world')
    expect(vnode.children[2].tag).toBe('br')
  })

  it('render svg elements with correct namespace', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    const vnode = h('svg', [h('a', [h('foo', [h('bar')])])])
    expect(vnode.ns).toBe('svg')
    // should apply ns to children recursively
    expect(vnode.children[0].ns).toBe('svg')
    expect(vnode.children[0].children[0].ns).toBe('svg')
    expect(vnode.children[0].children[0].children[0].ns).toBe('svg')
  })

  it('render MathML elements with correct namespace', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    const vnode = h('math', [h('matrix')])
    expect(vnode.ns).toBe('math')
    // should apply ns to children
    expect(vnode.children[0].ns).toBe('math')
    // although not explicitly listed, elements nested under <math>
    // should not be treated as component
    expect(vnode.children[0].componentOptions).toBeUndefined()
  })

  it('warn observed data objects', () => {
    new Vue({
      data: {
        data: {}
      },
      render (h) {
        return h('div', this.data)
      }
    }).$mount()
    expect('Avoid using observed data object as vnode data').toHaveBeenWarned()
  })
})
