const sendMail = require('../lib/send-mail')
const User = require('../model/user')
const {drive: {parentFolder}} = require('../config')

const subjectTemplate = ({username, firstName, lastName}) => `Reporte de ${firstName} ${lastName} (${username}).`
const bodyTemplate = (date, {username}) => 'Hola, ' +
  `\n\nEl usuario '${username}' ha indicado a las ${date} que no recibió el espacio en condiciones.` +
  `\n\nSe pueden verificar las fotos previas (subidas por sus compañeros anteriores) en: https://drive.google.com/drive/u/0/folders/${parentFolder}` +
  '\n\nGracias, ' +
  '\nDOUP! Staff admin'

async function sendReport({date, user: {username, firstName, lastName}}) {
  const subject = subjectTemplate({username, firstName, lastName})
  const body = bodyTemplate(date, {username})

  const admins = await User.find({isAdmin: true})
  if (!admins || admins.length === 0) {
    console.error(`Can't send  ${date} - '${subject}': No valid admin users found in DB`)
    return
  }

  const adminEmails = admins.map(({email}) => email)
  const to = adminEmails.join(', ')
  if (!to || to.length === 0) {
    console.error(`Can't send  ${date} - '${subject}': No valid admin recipient emails retrieved from DB`)
    return
  }

  try {
    await sendMail({subject, body, to})
  } catch (error) {
    console.error(`Problem sending ${date} - '${subject}'.`, error)
  }
}

module.exports = sendReport
