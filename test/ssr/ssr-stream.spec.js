import Vue from '../../dist/vue.common.js'
import { compileToFunctions } from '../../packages/vue-template-compiler'
import { createRenderer } from '../../packages/vue-server-renderer'
const { renderToStream } = createRenderer()

describe('SSR: renderToStream', () => {
  it('should render to a stream', done => {
    const stream = renderVmWithOptions({
      template: `
        <div>
          <p class="hi">yoyo</p>
          <div id="ho" :class="[testClass, { red: isRed }]"></div>
          <span>{{ test }}</span>
          <input :value="test">
          <b-comp></b-comp>
          <c-comp></c-comp>
        </div>
      `,
      data: {
        test: 'hi',
        isRed: true,
        testClass: 'a'
      },
      components: {
        bComp (resolve) {
          return resolve({
            render () {
              return this.$createElement('test-async-2')
            },
            components: {
              testAsync2 (resolve) {
                return resolve({
                  created () { this.$parent.$parent.testClass = 'b' },
                  render () {
                    return this.$createElement('div', { class: [this.$parent.$parent.testClass] }, 'test')
                  }
                })
              }
            }
          })
        },
        cComp: {
          render () {
            return this.$createElement('div', { class: [this.$parent.testClass] }, 'test')
          }
        }
      }
    })
    let res = ''
    stream.on('data', chunk => {
      res += chunk
    })
    stream.on('end', () => {
      expect(res).toContain(
        '<div server-rendered="true">' +
          '<p class="hi">yoyo</p> ' +
          '<div id="ho" class="a red"></div> ' +
          '<span>hi</span> ' +
          '<input value="hi"> ' +
          '<div class="b">test</div> ' +
          '<div class="b">test</div>' +
        '</div>'
      )
      done()
    })
  })

  it('should catch error', done => {
    const stream = renderToStream(new Vue({
      render () {
        throw new Error('oops')
      }
    }))
    stream.on('error', err => {
      expect(err.toString()).toMatch(/oops/)
      done()
    })
    stream.on('data', _ => _)
  })
})

function renderVmWithOptions (options) {
  const res = compileToFunctions(options.template)
  Object.assign(options, res)
  delete options.template
  return renderToStream(new Vue(options))
}
