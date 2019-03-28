const mongoose = require('mongoose')

const LessonsSchema = new mongoose.Schema({
  instructor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
  site: {type: String, required: true},
  discipline: {type: String, required: true}
})

LessonsSchema.index({instructor: 1, startDate: 1, endDate: 1, site: 1, discipline: 1}, {unique: true})

module.exports = mongoose.model('Lesson', LessonsSchema)
