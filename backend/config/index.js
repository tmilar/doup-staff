const config = {
  db: process.env.MONGODB_URL,
  authSecret: process.env.AUTH_TOKEN_SECRET,
  drive: {
    parentFolder: process.env.DRIVE_PARENT_FOLDER
  },
  gmail: {
    senderAccount: process.env.GMAIL_SENDER_ACCOUNT,
    sendAs: process.env.GMAIL_SEND_AS
  }
}

module.exports = config
