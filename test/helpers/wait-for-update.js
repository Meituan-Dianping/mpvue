import Vue from 'vue'

// helper for async assertions.
// Use like this:
//
// vm.a = 123
// waitForUpdate(() => {
//   expect(vm.$el.textContent).toBe('123')
//   vm.a = 234
// })
// .then(() => {
//   // more assertions...
// })
// .then(done)
window.waitForUpdate = initialCb => {
  const queue = initialCb ? [initialCb] : []

  function shift () {
    const job = queue.shift()
    if (queue.length) {
      let hasError = false
      try {
        job.wait ? job(shift) : job()
      } catch (e) {
        hasError = true
        const done = queue[queue.length - 1]
        if (done && done.fail) {
          done.fail(e)
        }
      }
      if (!hasError && !job.wait) {
        if (queue.length) {
          Vue.nextTick(shift)
        }
      }
    } else if (job && job.fail) {
      job() // done
    }
  }

  Vue.nextTick(() => {
    if (!queue.length || !queue[queue.length - 1].fail) {
      console.warn('waitForUpdate chain is missing .then(done)')
    }
    shift()
  })

  const chainer = {
    then: nextCb => {
      queue.push(nextCb)
      return chainer
    },
    thenWaitFor: (wait) => {
      if (typeof wait === 'number') {
        wait = timeout(wait)
      }
      wait.wait = true
      queue.push(wait)
      return chainer
    }
  }

  return chainer
}

function timeout (n) {
  return next => setTimeout(next, n)
}
