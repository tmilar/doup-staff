const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})


const Tabletop = require('tabletop')
const Promise = require('bluebird')
const db = require('../../config/db')
const usersMerger = require('./mergers/users')
const lessonsMerger = require('./mergers/lessons')

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
  if (!results) {
    const errMsg = 'No results to report!'
    throw new Error(errMsg)
  }

  if (results.length === 0) {
    console.log('Did not find any row to read from the Spreadsheet.')
    return
  }

  const resultsStr = results
    .map(({result}, i) => `#${i + 1} ${result}`)
    .join('\n')

  console.log(resultsStr)
}

function mergeAndReport(merger, rows, ...options) {
  return merger.save(rows, ...options)
    .then(reportResults)
}

const start = new Date(Date.UTC(2019, 3, 1, 3)) // Buenos Aires is UTC-3
const end = new Date(Date.UTC(2019, 3, 31, 3)) // Buenos Aires is UTC-3

Promise.all([dbConnect(), fetchRows(usersMerger.spreadsheetUrl), fetchRows(lessonsMerger.spreadsheetUrl)])
  .then(async ([_, userRows, lessonRows]) => {
    if (userRows) {
      console.log(`Merging ${userRows.length} user rows...`)
      await mergeAndReport(usersMerger, userRows)
    }

    if (lessonRows) {
      console.log(`Merging ${lessonRows.length} lesson rows...`)
      await mergeAndReport(lessonsMerger, lessonRows, start, end)
    }

    console.log('All rows merged.')
  })
  .then(async () => {
    console.log('Disconnecting DB')
    await db.disconnect()
    console.log('All done.')
    process.exitCode = 0
  })
  .catch(async error => {
    console.error(error)
    await db.disconnect()
    process.exitCode = 1
  })
