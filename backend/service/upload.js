const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')

const drive = google.drive({
  version: 'v3'
})

/**
 *
 * @param {string} filePath - the file path in the FS.
 * @param {Schema$File|object} fileMetadata - metadata object.
 * @param {string} fileMetadata.name - the name of the uploaded file.
 * @param {string[]} fileMetadata.parents - the parent folder id(s) where to place the file.
 * @param {string} [fileMetadata.description] - a description/comment to be included.
 * @param {object} [fileMetadata.contentHints] - additional info useful for drive system.
 * @param {string} [fileMetadata.contentHints.indexableText] - text to be indexed, for fullText queries.
 * @param {object} [fileMetadata.properties] - key/value properties for the file, can be used in search expressions.
 * @param {Compute | JWT | UserRefreshClient} auth - authorization object to do the google request.
 *
 * @returns {Promise<object>} - the uploaded file metadata
 */
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
