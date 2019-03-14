const mongoose = require('mongoose')
const User = require('./user')

const ReportSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  comment: {type: String, trim: true}
}, {
  timestamps: {createdAt: true, updatedAt: false}
})

module.exports = mongoose.model('Report', ReportSchema)
