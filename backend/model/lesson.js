const mongoose = require('mongoose')
const moment = require('moment-timezone')

const LessonsSchema = new mongoose.Schema({
  instructor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
  site: {type: String, required: true},
  discipline: {type: String, required: true},
  actualStartDate: Date,
  actualEndDate: Date
})

LessonsSchema.index({instructor: 1, startDate: 1, endDate: 1, site: 1, discipline: 1}, {unique: true})

const LESSON_TIME_TOLERANCE = {
  START: {
    MIN: moment.duration(-10, 'minutes'),
    MAX: moment.duration(20, 'minutes')
  },
  END: {
    MIN: moment.duration(-10, 'minutes'),
    MAX: moment.duration(15, 'minutes')
  }
}

/**
 * Look for the next upcoming lesson for the user.
 * This works by finding the first lesson in the future, by the end date (didn't finish yet).
 *
 * @param {ObjectId} userId - the id of the user
 * @returns {Promise<Lesson>} nextLesson - the upcoming lesson for the user
 */
LessonsSchema.statics.findNextForUser = async function (userId) {
  const now = moment()
  const [nextLesson] = await this
    .find({
      instructor: userId,
      endDate: {$gte: now.subtract(LESSON_TIME_TOLERANCE.END.MAX)},
      actualEndDate: {$exists: false}
    })
    .sort({startDate: 1})
    .limit(1) || []

  if (nextLesson) {
    delete nextLesson.__v
  }

  return nextLesson
}

/**
 * Method to save Lesson start date,
 * validating with allowed start date ranges.
 *
 * @param {Date} date - to be used for the actualStartDate
 * @returns {Promise<void>} - save promise
 */
LessonsSchema.methods.saveStartDate = async function (date) {
  const {startDate} = this
  const {MIN, MAX} = LESSON_TIME_TOLERANCE.START
  const minRange = moment(startDate).add(MIN)
  const maxRange = moment(startDate).add(MAX)
  const isInRange = moment(date).isBetween(minRange, maxRange)

  if (!isInRange) {
    const startDateStr = moment(startDate).format('HH:mm')
    const errMsg = `La clase sólo puede ser iniciada entre ${MIN.humanize()} antes y ${MAX.humanize()} después de la hora de inicio (${startDateStr}).`
    const error = new Error(errMsg)
    error.status = 400
    throw error
  }

  // Is in valid range => save the start date
  this.actualStartDate = date
  await this.save()
}

/**
 * Method to save Lesson end date,
 * validating with allowed end date ranges.
 *
 * @param {Date} date - to be used for the actualEndDate
 * @returns {Promise<void>} - save promise
 */
LessonsSchema.methods.saveEndDate = async function (date) {
  const {endDate} = this
  const {MIN, MAX} = LESSON_TIME_TOLERANCE.END
  const minRange = moment(endDate).add(MIN)
  const maxRange = moment(endDate).add(MAX)
  const isInRange = moment(date).isBetween(minRange, maxRange)

  if (!isInRange) {
    const endDateStr = moment(endDate).format('HH:mm')
    const errMsg = `La clase sólo puede ser finalizada entre ${MIN.humanize()} antes y ${MAX.humanize()} después de la hora de fin (${endDateStr}).`
    const error = new Error(errMsg)
    error.status = 400
    throw error
  }

  // Is in valid range => save the end date
  this.actualEndDate = date
  await this.save()
}

module.exports = mongoose.model('Lesson', LessonsSchema)
