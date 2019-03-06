const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')

const drive = google.drive({
  version: 'v3'
})

async function run({filePath, fileMetadata, auth}) {
  const fileSize = fs.statSync(filePath).size

  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(filePath)
  }

  const res = await drive.files.create({
    auth,
    requestBody: fileMetadata,
    media
  }, {
    // Use the `onUploadProgress` event from Axios to track the
    // number of bytes uploaded to this point.
    onUploadProgress: evt => {
      const progress = (evt.bytesRead / fileSize) * 100
      readline.clearLine()
      readline.cursorTo(0)
      process.stdout.write(`${Math.round(progress)}% complete`)
    }
  })
  process.stdout.write('\n')
  return res.data
}

module.exports = {
  run
}
