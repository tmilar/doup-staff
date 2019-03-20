const mongoose = require('mongoose')

const LessonsSchema = new mongoose.Schema({
  instructor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
  site: {type: String, required: true},
  discipline: {type: String, required: true}
})

module.exports = mongoose.model('Lesson', LessonsSchema)
