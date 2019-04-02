const mongoose = require('mongoose')

const LessonsSchema = new mongoose.Schema({
  instructor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
  site: {type: String, required: true},
  discipline: {type: String, required: true}
})

LessonsSchema.index({instructor: 1, startDate: 1, endDate: 1, site: 1, discipline: 1}, {unique: true})

/**
 * Look for the next upcoming lesson for the user.
 * This works by finding the first lesson in the future, by the end date (didn't finish yet).
 *
 * @param {ObjectId} userId - the id of the user
 * @returns {Promise<Lesson>} nextLesson - the upcoming lesson for the user
 */
LessonsSchema.statics.findNextForUser = async function (userId) {
  const [nextLesson] = await this
    .find({instructor: userId, endDate: {$gte: new Date()}})
    .sort({startDate: 1})
    .limit(1) || []

  if (nextLesson) {
    delete nextLesson.__v
  }

  return nextLesson
}

module.exports = mongoose.model('Lesson', LessonsSchema)
