export default {
  toLowerCase (str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().trim()
  },

  getChar (index) {
    return String.fromCharCode(0x61 + index)
  },

  log (compiled) {
    compiled.mpErrors = []
    compiled.mpTips = []

    return (str, type) => {
      if (type === 'waring') {
        compiled.mpTips.push(str)
      } else {
        compiled.mpErrors.push(str)
      }
    }
  }
}
