const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const saltRounds = 10

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true, trim: true},
  email: {type: String, unique: true, sparse: true},
  password: {type: String, required: true, select: false},
  isAdmin: {type: Boolean, select: false},
  firstName: {type: String, trim: true},
  lastName: {type: String, trim: true}
})

UserSchema.pre('save', async function () {
  // Check if document is new or a new password has been set
  if (!(this.isNew || this.isModified('password'))) {
    return
  }

  // Read the input password, then encrypt it
  const {password} = this
  this.password = await bcrypt.hash(password, saltRounds)
})

UserSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', UserSchema)
