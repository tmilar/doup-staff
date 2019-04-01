const lessonsSpreadsheetUrl = process.env.LESSONS_SPREADSHEET
if (!lessonsSpreadsheetUrl || lessonsSpreadsheetUrl.length === 0) {
  throw new Error('The spreadsheet url must be set in env variable USERS_SPREADSHEET.')
}

const Promise = require('bluebird')
const {DateTime, Settings, Interval} = require('luxon')

Settings.defaultZoneName = 'America/Argentina/Buenos_Aires'

const Lesson = require('../../../model/lesson')
const User = require('../../../model/user')
const fetchRows = require('../util/fetch-rows')
const trimStringValues = require('../util/trim-string-values')

const dayNamesSpanish = ['lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo']

function buildLessonString({date, weekDayString = '', startTime, endTime, startDate, endDate, discipline, site, instructor = null}) {
  if (!weekDayString || weekDayString.length === 0) {
    const weekDay = DateTime.fromJSDate(startDate || date).toFormat('c')
    weekDayString = dayNamesSpanish[weekDay - 1]
  }

  const instructorName = (instructor && `${instructor.firstName} ${instructor.lastName}`) || ''

  if (!startTime || !endTime) {
    startTime = DateTime.fromJSDate(startDate).toFormat('HH:mm')
    endTime = DateTime.fromJSDate(endDate).toFormat('HH:mm')
  }

  const lessonDayStr = `${DateTime.fromJSDate(date || startDate).toLocaleString(DateTime.DATE_FULL)}`
  return `${weekDayString}, ${lessonDayStr}, ${startTime} - ${endTime}, ${instructorName}, ${discipline}, ${site}`
}

async function lessonRowMapper(row, weekNumber, weekYear) {
  trimStringValues(row)

  const {
    dia: weekDayString,
    hora_inicio: startTime,
    hora_fin: endTime,
    actividad: discipline,
    espacio: site,
    nombre: firstName,
    apellido: lastName
  } = row

  const weekday = dayNamesSpanish.findIndex(dayName => dayName === weekDayString.toLowerCase()) + 1
  const dateFormatString = 'c W kkkk HH:mm' // Format: 'weekDay weekNumber weekYear hour:minute'
  const lessonDateBuilder = timeHoursMinutes => DateTime.fromFormat(`${weekday} ${weekNumber} ${weekYear} ${timeHoursMinutes}`, dateFormatString).toJSDate()

  const startDate = lessonDateBuilder(startTime)
  const endDate = lessonDateBuilder(endTime)

  const instructor = await User.findOne({firstName, lastName})

  if (!instructor) {
    const lessonStr = buildLessonString({date: startDate, weekDayString, startTime, endTime, discipline, site})
    console.error(`Could not find User for instructor '${firstName} ${lastName}', cannot map lesson: '${lessonStr}'`)
    return null
  }

  return {
    startDate,
    endDate,
    instructor,
    discipline,
    site
  }
}

async function saveLessons(lessonRows, startDate, endDate) {
  const interval = Interval.fromDateTimes(startDate, endDate)
  let cursorDate = DateTime.fromJSDate(startDate)

  const weekAndYears = []
  while (interval.contains(cursorDate)) {
    const {weekNumber, year} = cursorDate
    weekAndYears.push({weekNumber, year})
    cursorDate = cursorDate.plus({weeks: 1})
  }

  const lessonsToSave = []

  await Promise.mapSeries(weekAndYears, async ({weekNumber, year}) => {
    const lessons = await Promise
      .mapSeries(lessonRows, row => lessonRowMapper(row, weekNumber, year))
      .filter(lesson => Boolean(lesson))

    lessonsToSave.push(...lessons)
  })

  return Promise.mapSeries(lessonsToSave, async lesson => {
    const lessonStr = buildLessonString(lesson)
    try {
      await Lesson.create(lesson)
    } catch (error) {
      return {result: `Lesson '${lessonStr}' error: ${error.message || error}`}
    }

    return {result: `Lesson '${lessonStr}' saved succesfully.`}
  })
}

module.exports = {
  fetch: () => fetchRows(lessonsSpreadsheetUrl),
  save: saveLessons
}
