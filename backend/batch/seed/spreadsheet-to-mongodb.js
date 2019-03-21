const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})


const Tabletop = require('tabletop')
const Promise = require('bluebird')
const db = require('../../config/db')
const usersMerger = require('./mergers/users')

async function dbConnect() {
  const {connection: {name}} = await db.connect()
  console.log(`db connection open: ${name}`)
}

function fetchRows(spreadsheetUrl) {
  return new Promise((resolve, reject) => {
    Tabletop.init({
      key: spreadsheetUrl,
      simpleSheet: true,
      callback: data => {
        if (!data) {
          return reject(new Error('Could not process data'))
        }

        console.log(`Successfully processed ${data.length} rows from Spreadsheet.`)
        resolve(data)
      }
    })
  })
}

function reportResults(results) {
  if (results.length === 0) {
    console.log('Did not find any row to read from the Spreadsheet.')
    return
  }

  const resultsStr = results
    .map(({result}, i) => `#${i + 1} ${result}`)
    .join('\n')

  console.log(resultsStr)
}

Promise.all([dbConnect(), fetchRows(usersMerger.spreadsheetUrl)])
  .then(([,userRows]) => usersMerger.save(userRows))
  .then(reportResults)
  .then(async () => {
    await db.disconnect()
    process.exitCode = 0
  })
  .catch(async error => {
    console.error(error)
    await db.disconnect()
    process.exitCode = 1
  })
