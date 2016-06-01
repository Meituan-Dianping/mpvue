import Vue from 'vue'

describe('Global config', () => {
  describe('preserveWhitespace', () => {
    it('should preserve whitepspaces when set to true', () => {
      // this option is set to false during unit tests.
      Vue.config.preserveWhitespace = true
      const vm = new Vue({
        template: '<div><span>hi</span> <span>ha</span></div>'
      }).$mount()
      expect(vm.$el.innerHTML).toBe('<span>hi</span> <span>ha</span>')
      Vue.config.preserveWhitespace = false
    })

    it('should remove whitespaces when set to false', () => {
      const vm = new Vue({
        template: '<div><span>hi</span> <span>ha</span></div>'
      }).$mount()
      expect(vm.$el.innerHTML).toBe('<span>hi</span><span>ha</span>')
    })
  })

  describe('silent', () => {
    it('should be false by default', () => {
      Vue.util.warn('foo')
      expect('foo').toHaveBeenWarned()
    })

    it('should work when set to true', () => {
      Vue.config.silent = true
      Vue.util.warn('foo')
      expect('foo').not.toHaveBeenWarned()
      Vue.config.silent = false
    })
  })

  describe('errorHandler', () => {
    Vue.config.errorHandler = spy
    const err = new Error()
    const vm = new Vue({
      render () { throw err }
    }).$mount()
    expect(spy).toHaveBeenCalledWith(err, vm)
    Vue.config.errorHandler = null
  })
})
