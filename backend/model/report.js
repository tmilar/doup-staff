const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  comment: {type: String, trim: true},
  date: {type: Date, required: true}
}, {
  timestamps: {createdAt: true, updatedAt: false}
})

module.exports = mongoose.model('Report', ReportSchema)
