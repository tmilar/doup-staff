const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const saltRounds = 10

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}
})

UserSchema.pre('save', async function () {
  // Check if document is new or a new password has been set
  if (!(this.isNew || this.isModified('password'))) {
    return
  }

  // Saving reference to this because of changing scopes
  const document = this
  document.password = await bcrypt.hash(document.password, saltRounds)
})

UserSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', UserSchema)
