const styles = new Proxy(
  {},
  {
    get(target, property) {
      if (property in target) {
        return target[property]
      }

      return typeof property === 'string' ? property : ''
    },
  }
)

module.exports = styles
module.exports.default = styles
