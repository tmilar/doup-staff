const Tabletop = require('tabletop')
const Promise = require('bluebird')

module.exports = function fetchRows(spreadsheetUrl) {
  return new Promise((resolve, reject) => {
    Tabletop.init({
      key: spreadsheetUrl,
      simpleSheet: true,
      callback: data => {
        if (!data) {
          return reject(new Error('Could not process data'))
        }

        resolve(data)
      }
    })
  })
}
