import { parse } from 'compiler/parser/index'
import { optimize } from 'compiler/optimizer'
import { baseOptions } from 'web/compiler/index'

describe('optimizer', () => {
  it('simple', () => {
    const ast = parse('<h1 id="section1">hello world</h1>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(true) // h1
    expect(ast.staticRoot).toBe(true)
    expect(ast.children[0].static).toBe(true) // text node
  })

  it('interpolation', () => {
    const ast = parse('<h1>{{msg}}</h1>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false) // h1
    expect(ast.children[0].static).toBe(false) // text node with interpolation
  })

  it('nested elements', () => {
    const ast = parse('<ul><li>hello</li><li>world</li></ul>', baseOptions)
    optimize(ast, baseOptions)
    // ul
    expect(ast.static).toBe(true)
    expect(ast.staticRoot).toBe(true)
    // li
    expect(ast.children[0].static).toBe(true) // first
    expect(ast.children[1].static).toBe(true) // second
    // text node inside li
    expect(ast.children[0].children[0].static).toBe(true) // first
    expect(ast.children[1].children[0].static).toBe(true) // second
  })

  it('nested complex elements', () => {
    const ast = parse('<ul><li>{{msg1}}</li><li>---</li><li>{{msg2}}</li></ul>', baseOptions)
    optimize(ast, baseOptions)
    // ul
    expect(ast.static).toBe(false) // ul
    // li
    expect(ast.children[0].static).toBe(false) // firts
    expect(ast.children[1].static).toBe(true) // second
    expect(ast.children[2].static).toBe(false) // third
    // text node inside li
    expect(ast.children[0].children[0].static).toBe(false) // first
    expect(ast.children[1].children[0].static).toBe(true) // second
    expect(ast.children[2].children[0].static).toBe(false) // third
  })

  it('v-if directive', () => {
    const ast = parse('<h1 id="section1" v-if="show">hello world</h1>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(true)
  })

  it('v-else directive', () => {
    const ast = parse('<div><p v-if="show">hello world</p><p v-else>foo bar</p></div>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(false)
    expect(ast.children[0].elseBlock.static).toBeUndefined()
  })

  it('v-pre directive', () => {
    const ast = parse('<ul v-pre><li>{{msg}}</li><li>world</li></ul>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(true)
    expect(ast.staticRoot).toBe(true)
    expect(ast.children[0].static).toBe(true)
    expect(ast.children[1].static).toBe(true)
    expect(ast.children[0].children[0].static).toBe(true)
    expect(ast.children[1].children[0].static).toBe(true)
  })

  it('v-for directive', () => {
    const ast = parse('<ul><li v-for="item in items">hello world {{$index}}</li></ul>', baseOptions)
    optimize(ast, baseOptions)
    // ul
    expect(ast.static).toBe(false)
    // li with v-for
    expect(ast.children[0].static).toBe(false)
    expect(ast.children[0].children[0].static).toBe(false)
  })

  it('v-once directive', () => {
    const ast = parse('<p v-once>{{msg}}</p>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false) // p
    expect(ast.children[0].static).toBe(false) // text node
  })

  it('render tag', () => {
    const ast = parse('<render :method="onRender"><p>hello</p></render>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(true)
    expect(ast.children[0].children[0].static).toBe(true)
  })

  it('single slot', () => {
    const ast = parse('<slot>hello</slot>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false) // slot
    expect(ast.children[0].static).toBe(true) // text node
  })

  it('named slot', () => {
    const ast = parse('<slot name="one">hello world</slot>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false) // slot
    expect(ast.children[0].static).toBe(true) // text node
  })

  it('slot target', () => {
    const ast = parse('<p slot="one">hello world</p>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false) // slot
    expect(ast.children[0].static).toBe(true) // text node
  })

  it('component', () => {
    const ast = parse('<my-component></my-component>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false) // component
  })

  it('component for inline-template', () => {
    const ast = parse('<my-component inline-template><p>hello world</p><p>{{msg}}</p></my-component>', baseOptions)
    optimize(ast, baseOptions)
    // component
    expect(ast.static).toBe(false) // component
    // p
    expect(ast.children[0].static).toBe(true) // first
    expect(ast.children[1].static).toBe(false) // second
    // text node inside p
    expect(ast.children[0].children[0].static).toBe(true) // first
    expect(ast.children[1].children[0].static).toBe(false) // second
  })

  it('class binding', () => {
    const ast = parse('<p :class="class1">hello world</p>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(true)
  })

  it('style binding', () => {
    const ast = parse('<p :style="error">{{msg}}</p>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(false)
  })

  it('key', () => {
    const ast = parse('<p key="foo">hello world</p>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(true)
  })

  it('ref', () => {
    const ast = parse('<p ref="foo">hello world</p>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(true)
  })

  it('transition', () => {
    const ast = parse('<p v-if="show" transition="expand">hello world</p>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(true)
  })

  it('v-bind directive', () => {
    const ast = parse('<input type="text" name="field1" :value="msg">', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
  })

  it('v-on directive', () => {
    const ast = parse('<input type="text" name="field1" :value="msg" @input="onInput">', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
  })

  it('custom directive', () => {
    const ast = parse('<fom><input type="text" name="field1" :value="msg" v-validate:field1="required"></form>', baseOptions)
    optimize(ast, baseOptions)
    expect(ast.static).toBe(false)
    expect(ast.children[0].static).toBe(false)
  })

  it('not root ast', () => {
    const ast = null
    optimize(ast, baseOptions)
    expect(ast).toBe(null)
  })

  it('not specified isReservedTag option', () => {
    const ast = parse('<h1 id="section1">hello world</h1>', baseOptions)
    optimize(ast, {})
    expect(ast.static).toBe(false)
  })
})
