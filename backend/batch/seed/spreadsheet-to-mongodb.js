const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})

const spreadsheetUrl = process.env.USERS_SPREADSHEET
if(!spreadsheetUrl || spreadsheetUrl.length === 0) {
  throw new Error('The spreadsheet url must be set in env variable USERS_SPREADSHEET.')
}

const Tabletop = require('tabletop')
const Promise = require('bluebird')
const db = require('../../config/db')
const User = require('../../model/user')

async function dbConnect() {
  const {connection: {name}} = await db.connect()
  console.log(`db connection open: ${name}`)
}

function fetchRows() {
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

async function saveUsers(userRows) {
  const users = userRows.map(({dni, nombre, apellido, rol, email}) => {
    const isAdmin = (rol && rol.toLowerCase() === 'admin') || undefined
    const username = nombre.toLowerCase()[0] + apellido.toLowerCase()
    email = email || undefined
    return {
      password: dni,
      firstName: nombre,
      lastName: apellido,
      isAdmin,
      username,
      email
    }
  })

  return Promise.mapSeries(users, async user => {
    try {
      await User.create(user)
    } catch (error) {
      return {result: `User '${user.username}' error: ${error.message || error}`}
    }

    return {result: `User '${user.username}' saved succesfully.`}
  })
}

function reportResults(results) {
  if(results.length === 0) {
    console.log('Did not find any row to read from the Spreadsheet.')
    return
  }

  const resultsStr = results
    .map(({result}, i) => `#${i + 1} ${result}`)
    .join('\n')

  console.log(resultsStr)
}

Promise.all([fetchRows(), dbConnect()])
  .then(([userRows]) => saveUsers(userRows))
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
