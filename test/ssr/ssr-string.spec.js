import Vue from '../../dist/vue.common.js'
import { compileToFunctions } from '../../packages/vue-template-compiler'
import createRenderer from '../../packages/vue-server-renderer'
const { renderToString } = createRenderer()

describe('SSR: renderToString', () => {
  it('static attributes', done => {
    renderVmWithOptions({
      template: '<div id="foo" bar="123"></div>'
    }, result => {
      expect(result).toContain('<div id="foo" bar="123" server-rendered="true"></div>')
      done()
    })
  })

  it('unary tags', done => {
    renderVmWithOptions({
      template: '<input value="123">'
    }, result => {
      expect(result).toContain('<input value="123" server-rendered="true">')
      done()
    })
  })

  it('dynamic attributes', done => {
    renderVmWithOptions({
      template: '<div qux="quux" :id="foo" :bar="baz"></div>',
      data: {
        foo: 'hi',
        baz: 123
      }
    }, result => {
      expect(result).toContain('<div qux="quux" id="hi" bar="123" server-rendered="true"></div>')
      done()
    })
  })

  it('static class', done => {
    renderVmWithOptions({
      template: '<div class="foo bar"></div>'
    }, result => {
      expect(result).toContain('<div server-rendered="true" class="foo bar"></div>')
      done()
    })
  })

  it('dynamic class', done => {
    renderVmWithOptions({
      template: '<div class="foo bar" :class="[a, { qux: hasQux, quux: hasQuux }]"></div>',
      data: {
        a: 'baz',
        hasQux: true,
        hasQuux: false
      }
    }, result => {
      expect(result).toContain('<div server-rendered="true" class="foo bar baz qux"></div>')
      done()
    })
  })

  it('dynamic style', done => {
    renderVmWithOptions({
      template: '<div style="background-color:black" :style="{ fontSize: fontSize + \'px\', color: color }"></div>',
      data: {
        fontSize: 14,
        color: 'red'
      }
    }, result => {
      expect(result).toContain(
        '<div server-rendered="true" style="font-size:14px;color:red;background-color:black"></div>'
      )
      done()
    })
  })

  it('text interpolation', done => {
    renderVmWithOptions({
      template: '<div>{{ foo }} side {{ bar }}</div>',
      data: {
        foo: 'server',
        bar: '<span>rendering</span>'
      }
    }, result => {
      expect(result).toContain('<div server-rendered="true">server side &lt;span&gt;rendering&lt;&sol;span&gt;</div>')
      done()
    })
  })

  it('v-html', done => {
    renderVmWithOptions({
      template: '<div v-html="text"></div>',
      data: {
        text: '<span>foo</span>'
      }
    }, result => {
      expect(result).toContain('<div server-rendered="true"><span>foo</span></div>')
      done()
    })
  })

  it('v-text', done => {
    renderVmWithOptions({
      template: '<div v-text="text"></div>',
      data: {
        text: '<span>foo</span>'
      }
    }, result => {
      expect(result).toContain('<div server-rendered="true">&lt;span&gt;foo&lt;&sol;span&gt;</div>')
      done()
    })
  })

  it('child component (hoc)', done => {
    renderVmWithOptions({
      template: '<child class="foo" :msg="msg"></child>',
      data: {
        msg: 'hello'
      },
      components: {
        child: {
          props: ['msg'],
          data () {
            return { name: 'bar' }
          },
          render () {
            const h = this.$createElement
            return h('div', { class: ['bar'] }, [`${this.msg} ${this.name}`])
          }
        }
      }
    }, result => {
      expect(result).toContain('<div server-rendered="true" class="foo bar">hello bar</div>')
      done()
    })
  })

  it('has correct lifecycle during render', done => {
    let lifecycleCount = 1
    renderVmWithOptions({
      template: '<div><span>{{ val }}</span><test></test></div>',
      data: {
        val: 'hi'
      },
      init () {
        expect(lifecycleCount++).toBe(1)
      },
      created () {
        this.val = 'hello'
        expect(this.val).toBe('hello')
        expect(lifecycleCount++).toBe(2)
      },
      components: {
        test: {
          init () {
            expect(lifecycleCount++).toBe(3)
          },
          created () {
            expect(lifecycleCount++).toBe(4)
          },
          render () {
            expect(lifecycleCount++).toBeGreaterThan(4)
            return this.$createElement('span', { class: ['b'] }, 'testAsync')
          }
        }
      }
    }, result => {
      expect(result).toContain(
        '<div server-rendered="true">' +
          '<span>hello</span>' +
          '<span class="b">testAsync</span>' +
        '</div>'
      )
      done()
    })
  })

  it('renders asynchronous component', done => {
    renderVmWithOptions({
      template: `
        <div>
          <test-async></test-async>
        </div>
      `,
      components: {
        testAsync (resolve) {
          resolve({
            render () {
              return this.$createElement('span', { class: ['b'] }, 'testAsync')
            }
          })
        }
      }
    }, result => {
      expect(result).toContain('<div server-rendered="true"><span class="b">testAsync</span></div>')
      done()
    })
  })

  it('renders asynchronous component (hoc)', done => {
    renderVmWithOptions({
      template: '<test-async></test-async>',
      components: {
        testAsync (resolve) {
          resolve({
            render () {
              return this.$createElement('span', { class: ['b'] }, 'testAsync')
            }
          })
        }
      }
    }, result => {
      expect(result).toContain('<span server-rendered="true" class="b">testAsync</span>')
      done()
    })
  })

  it('renders nested asynchronous component', done => {
    renderVmWithOptions({
      template: `
        <div>
          <test-async></test-async>
        </div>
      `,
      components: {
        testAsync (resolve) {
          const options = compileToFunctions(`
            <span class="b">
              <test-sub-async></test-sub-async>
            </span>
          `, { preserveWhitespace: false })

          options.components = {
            testSubAsync (resolve) {
              resolve({
                render () {
                  return this.$createElement('div', { class: ['c'] }, 'testSubAsync')
                }
              })
            }
          }
          resolve(options)
        }
      }
    }, result => {
      expect(result).toContain('<div server-rendered="true"><span class="b"><div class="c">testSubAsync</div></span></div>')
      done()
    })
  })

  it('everything together', done => {
    renderVmWithOptions({
      template: `
        <div>
          <p class="hi">yoyo</p>
          <div id="ho" :class="{ red: isRed }"></div>
          <span>{{ test }}</span>
          <input :value="test">
          <img :src="imageUrl">
          <test></test>
          <test-async></test-async>
        </div>
      `,
      data: {
        test: 'hi',
        isRed: true,
        imageUrl: 'https://vuejs.org/images/logo.png'
      },
      components: {
        test: {
          render () {
            return this.$createElement('div', { class: ['a'] }, 'test')
          }
        },
        testAsync (resolve) {
          resolve({
            render () {
              return this.$createElement('span', { class: ['b'] }, 'testAsync')
            }
          })
        }
      }
    }, result => {
      expect(result).toContain(
        '<div server-rendered="true">' +
          '<p class="hi">yoyo</p> ' +
          '<div id="ho" class="red"></div> ' +
          '<span>hi</span> ' +
          '<input value="hi"> ' +
          '<img src="https://vuejs.org/images/logo.png"> ' +
          '<div class="a">test</div> ' +
          '<span class="b">testAsync</span>' +
        '</div>'
      )
      done()
    })
  })

  it('normal attr', done => {
    renderVmWithOptions({
      template: `
        <div>
          <span :test="'ok'">hello</span>
          <span :test="null">hello</span>
          <span :test="false">hello</span>
          <span :test="true">hello</span>
          <span :test="0">hello</span>
        </div>
      `
    }, result => {
      expect(result).toContain(
        '<div server-rendered="true">' +
          '<span test="ok">hello</span> ' +
          '<span>hello</span> ' +
          '<span>hello</span> ' +
          '<span test="true">hello</span> ' +
          '<span test="0">hello</span>' +
        '</div>'
      )
      done()
    })
  })

  it('enumrated attr', done => {
    renderVmWithOptions({
      template: `
        <div>
          <span :draggable="true">hello</span>
          <span :draggable="'ok'">hello</span>
          <span :draggable="null">hello</span>
          <span :draggable="false">hello</span>
          <span :draggable="''">hello</span>
          <span :draggable="'false'">hello</span>
        </div>
      `
    }, result => {
      expect(result).toContain(
        '<div server-rendered="true">' +
          '<span draggable="true">hello</span> ' +
          '<span draggable="true">hello</span> ' +
          '<span draggable="false">hello</span> ' +
          '<span draggable="false">hello</span> ' +
          '<span draggable="true">hello</span> ' +
          '<span draggable="false">hello</span>' +
        '</div>'
      )
      done()
    })
  })

  it('boolean attr', done => {
    renderVmWithOptions({
      template: `
        <div>
          <span :disabled="true">hello</span>
          <span :disabled="'ok'">hello</span>
          <span :disabled="null">hello</span>
          <span :disabled="''">hello</span>
        </div>
      `
    }, result => {
      expect(result).toContain(
        '<div server-rendered="true">' +
          '<span disabled="disabled">hello</span> ' +
          '<span disabled="disabled">hello</span> ' +
          '<span>hello</span> ' +
          '<span disabled="disabled">hello</span>' +
        '</div>'
      )
      done()
    })
  })

  it('v-bind object', done => {
    renderVmWithOptions({
      data: {
        test: { id: 'a', class: 'b', value: 'c' }
      },
      template: '<input v-bind="test">'
    }, result => {
      expect(result).toContain('<input id="a" class="b" server-rendered="true" value="c">')
      done()
    })
  })

  it('custom directives', done => {
    const renderer = createRenderer({
      directives: {
        'class-prefixer': (node, dir) => {
          if (node.data.class) {
            node.data.class = `${dir.value}-${node.data.class}`
          }
          if (node.data.staticClass) {
            node.data.staticClass = `${dir.value}-${node.data.staticClass}`
          }
        }
      }
    })
    renderer.renderToString(new Vue({
      render () {
        const h = this.$createElement
        return h('p', {
          class: 'class1',
          staticClass: 'class2',
          directives: [{
            name: 'class-prefixer',
            value: 'my'
          }]
        }, ['hello world'])
      }
    }), (err, result) => {
      expect(err).toBeNull()
      expect(result).toContain('<p server-rendered="true" class="my-class2 my-class1">hello world</p>')
      done()
    })
  })

  it('_scopeId', done => {
    renderVmWithOptions({
      _scopeId: '_v-parent',
      template: '<div id="foo"><p><child></child></p></div>',
      components: {
        child: {
          _scopeId: '_v-child',
          render () {
            const h = this.$createElement
            return h('div', null, [h('span', null, ['foo'])])
          }
        }
      }
    }, result => {
      expect(result).toContain(
        '<div id="foo" server-rendered="true" _v-parent>' +
          '<p _v-parent>' +
            '<div _v-child _v-parent><span _v-child>foo</span></div>' +
          '</p>' +
        '</div>'
      )
      done()
    })
  })

  it('_scopeId on slot content', done => {
    renderVmWithOptions({
      _scopeId: '_v-parent',
      template: '<div><child><p>foo</p></child></div>',
      components: {
        child: {
          _scopeId: '_v-child',
          render () {
            const h = this.$createElement
            return h('div', null, this.$slots.default)
          }
        }
      }
    }, result => {
      expect(result).toContain(
        '<div server-rendered="true" _v-parent>' +
          '<div _v-child _v-parent><p _v-child _v-parent>foo</p></div>' +
        '</div>'
      )
      done()
    })
  })

  it('should catch error', done => {
    renderToString(new Vue({
      render () {
        throw new Error('oops')
      }
    }), err => {
      expect(err instanceof Error).toBe(true)
      done()
    })
  })
})

function renderVmWithOptions (options, cb) {
  const res = compileToFunctions(options.template)
  Object.assign(options, res)
  delete options.template
  renderToString(new Vue(options), (err, res) => {
    expect(err).toBeNull()
    cb(res)
  })
}
