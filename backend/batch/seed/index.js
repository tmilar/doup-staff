const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})

const {luxon: {DateTime}} = require('./config')

const inputDateParamsFormat = 'yyyy-MM-dd'
const exampleStartDateParam = DateTime.local().startOf('month').startOf('week').toFormat(inputDateParamsFormat)
const exampleEndDateParam = DateTime.local().endOf('month').endOf('week').toFormat(inputDateParamsFormat)

const {_: selectedActions, start: lessonsStart, end: lessonsEnd} = require('yargs')
  .usage('Usage: $0 [options]')
  .demandCommand(1)
  .command('users', 'Merge users from spreadsheet to DB.')
  .command('lessons', 'Merge lessons from spreadsheet to DB.', yargs => {
    yargs
      .option('start', {
        description: `Lessons load start date (format: '${inputDateParamsFormat}'), inclusive.`
      })
      .option('end', {
        description: `Lessons load end date (format: '${inputDateParamsFormat}'), inclusive.`
      })
      .demand(['start', 'end'], `Must include --'start' and --'end' date params, in '${inputDateParamsFormat}' format.`)
  })
  .example('$0 users', 'Save users only')
  .example(`$0 lessons --start='${exampleStartDateParam}' --end='${exampleEndDateParam}'`, 'Save lessons only (in the specified time range)')
  .example(`$0 users lessons --start='${exampleStartDateParam}' --end='${exampleEndDateParam}'`, 'Save users and lessons (in the specified time range)')
  .coerce('start', dateStr => {
    const date = new Date(`${dateStr} GMT-0300`) // Lock to Buenos Aires timezone
    if (!date) {
      throw new Error(`Bad start date value: '${dateStr}'`)
    }

    return date
  })
  .coerce('end', dateStr => {
    const date = new Date(`${dateStr} 23:59:00 GMT-0300`) // Buneos Aires timezone + end of day
    if (!date) {
      throw new Error(`Bad end date value: '${dateStr}'`)
    }

    return date
  })
  .check(({start, end}) => {
    if (start && !end) {
      throw new Error('Missing \'end\' date param.')
    }

    if (end && !start) {
      throw new Error('Missing \'start\' date param.')
    }

    if (start && end && start > end) {
      throw new Error('Error: \'start\' date must be earlier than \'end\' date!')
    }

    return true
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .parse()

const Promise = require('bluebird')
const db = require('../../config/db')
const usersMerger = require('./mergers/users')
const lessonsMerger = require('./mergers/lessons')

const reportResults = require('./util/report-results')

async function dbConnect() {
  const {connection: {name, host, port}} = await db.connect()
  console.log(`db connection open: ${host}:${port}/${name}`)
}

function mergeAndReport(merger, rows, ...options) {
  return merger.save(rows, ...options)
    .then(reportResults)
}

Promise
  .all([
    dbConnect(),
    selectedActions.includes('users') && usersMerger.fetch(),
    selectedActions.includes('lessons') && lessonsMerger.fetch()
  ])
  .then(async ([_, userRows, lessonRows]) => {
    if (userRows) {
      console.log(`Merging ${userRows.length} user rows...`)
      await mergeAndReport(usersMerger, userRows)
    }

    if (lessonRows) {
      console.log(`Merging ${lessonRows.length} lesson rows...`)
      await mergeAndReport(lessonsMerger, lessonRows, lessonsStart, lessonsEnd)
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
    console.error("Error...", error)
    await db.disconnect()
    process.exitCode = 1
  })
