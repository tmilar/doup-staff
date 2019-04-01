const usersSpreadsheetUrl = process.env.USERS_SPREADSHEET
if (!usersSpreadsheetUrl || usersSpreadsheetUrl.length === 0) {
  throw new Error('The spreadsheet url must be set in env variable USERS_SPREADSHEET.')
}

const Promise = require('bluebird')
const User = require('../../../model/user')
const fetchRows = require('../util/fetch-rows')
const trimStringValues = require('../util/trim-string-values')

async function saveUsers(userRows) {
  if (!userRows) {
    console.error('No user rows defined.')
    return []
  }

  const users = userRows.map(row => {
    trimStringValues(row)

    const {
      dni,
      nombre: firstName,
      apellido: lastName,
      rol: role,
      email
    } = row

    const isAdmin = (role && role.toLowerCase() === 'admin') || undefined
    const username = firstName.toLowerCase()[0] + lastName.toLowerCase()

    return {
      password: dni,
      firstName,
      lastName,
      isAdmin,
      username,
      email: email || undefined
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

module.exports = {
  fetch: () => fetchRows(usersSpreadsheetUrl),
  save: saveUsers,
}
