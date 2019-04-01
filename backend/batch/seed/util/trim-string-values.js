module.exports = function trimStringValues(row = {}) {
  Object.entries(row).forEach(([key, value]) => {
    if (typeof value === 'string') {
      row[key] = value.trim()
    }
  })
}
