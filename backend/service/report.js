const sendMail = require('../lib/send-mail')
const User = require('../model/user')
const {drive: {parentFolder}} = require('../config')
const moment = require('moment-timezone')

const subjectTemplate = ({username, firstName, lastName, site}) => `Reporte de ${firstName} ${lastName} (${username}), en ${site}.`
const bodyTemplate = (date, {username}, previousLessons = [], currentLesson) => [
  'Hola, ',
  '',
  `El usuario '${username}' ha indicado el ${moment(date).format("dddd, D [de] MMMM, [a las] HH:mm")}, que no recibió el espacio '${currentLesson.site}' en condiciones.`,
  '',
  previousLessons.length ?
    [
      'Las clases previas en esa fecha y espacio, fueron: ',
      '',
      previousLessons
        .map(({startDate, endDate, discipline, instructor: {firstName, lastName} = {}}) =>
          `\t* ${discipline} (por ${firstName} ${lastName}), de ${moment(startDate).format('HH:mm')} a ${moment(endDate).format('HH:mm')}.`)
        .join('\n')
    ].join('\n')
    :
    'Es la primer clase del día en este espacio.',
  '',
  `Se pueden verificar las fotos previas (subidas por sus compañeros anteriores), en: `,
  `https://drive.google.com/drive/u/0/folders/${parentFolder}`,
  '',
  'Gracias, ',
  'DOUP! Staff admin'
].join('\n')

async function sendReport({date, user: {username, firstName, lastName}, previousLessons, currentLesson}) {
  const subject = subjectTemplate({username, firstName, lastName, site: currentLesson.site})
  const body = bodyTemplate(date, {username}, previousLessons, currentLesson)

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
