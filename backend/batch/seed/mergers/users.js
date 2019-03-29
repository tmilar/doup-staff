const usersSpreadsheetUrl = process.env.USERS_SPREADSHEET
if (!usersSpreadsheetUrl || usersSpreadsheetUrl.length === 0) {
  throw new Error('The spreadsheet url must be set in env variable USERS_SPREADSHEET.')
}

const Promise = require('bluebird')
const User = require('../../../model/user')

async function saveUsers(userRows) {
  if (!userRows) {
    console.error('No user rows defined.')
    return []
  }

  const users = userRows.map(({dni, nombre: firstName, apellido: lastName, rol: role, email}) => {
    const isAdmin = (role && role.toLowerCase() === 'admin') || undefined
    const username = firstName.toLowerCase()[0] + lastName.toLowerCase()
    email = email || undefined
    return {
      password: dni,
      firstName,
      lastName,
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

module.exports = {
  save: saveUsers,
  spreadsheetUrl: usersSpreadsheetUrl
}
