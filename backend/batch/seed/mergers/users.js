const Promise = require('bluebird')
const User = require('../../../model/user')
const fetchRows = require('../util/fetch-rows')
const trimStringValues = require('../util/trim-string-values')
const {spreadsheet: {users: usersSpreadsheetUrl}} = require('../config')

function _generateDefaultPassword(firstName) {
  const suffix = '123'
  return `${firstName.toLowerCase()}${suffix}`
}

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
    const password = dni || _generateDefaultPassword(firstName)

    return {
      password,
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
  fetch: async () => {
    console.log(`Fetching users from URL ${usersSpreadsheetUrl}`)
    const data = await fetchRows(usersSpreadsheetUrl)
    if (data) {
      console.log(`Successfully processed ${data.length} User rows from Spreadsheet.`)
      return data
    }
    console.error('Problem processing Users from Spreadsheet.')
  },
  save: saveUsers
}
