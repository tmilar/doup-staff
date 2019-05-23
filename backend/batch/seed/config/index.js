const {_: selectedActions} = require('yargs')

const {
  MONGODB_URL: dbUrl,
  USERS_SPREADSHEET: usersSpreadsheetUrl,
  LESSONS_SPREADSHEET: lessonsSpreadhseetUrl
} = process.env

if(!dbUrl || dbUrl.length === 0) {
  throw new Error('Must define Mongo DB URL in MONGODB_URL env variable!')
}

if(Array.isArray(selectedActions)) {
  if(selectedActions.includes('users') && (!usersSpreadsheetUrl || usersSpreadsheetUrl.length === 0)) {
    throw new Error('Selected \'users\' option, but the spreadsheet URL is not set in env variable USERS_SPREADSHEET.')
  }

  if (selectedActions.includes('users') && (!lessonsSpreadhseetUrl || lessonsSpreadhseetUrl.length === 0)) {
    throw new Error('Selected \'users\' option, but the spreadsheet URL is not set in env variable USERS_SPREADSHEET.')
  }
}

const config = {
  db: dbUrl,
  spreadsheet: {
    users: usersSpreadsheetUrl,
    lessons: lessonsSpreadhseetUrl
  }
}

module.exports = config
