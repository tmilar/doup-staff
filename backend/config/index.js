const config = {
  db: process.env.MONGODB_URL,
  drive: {
    parentFolder: process.env.DRIVE_PARENT_FOLDER
  }
}

module.exports = config
