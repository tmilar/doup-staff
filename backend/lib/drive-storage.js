const {google} = require('googleapis')
const {drive: {parentFolder}} = require('../config')

class DriveStorage {
  constructor(opts) {
    this.drive = google.drive(Object.assign(opts, {version: 'v3'}))
  }

  /**
   * Multer middleware file handler
   *
   * @param {IncomingMessage} req - express req object
   * @param {object} file - the file to be uploaded
   * @param {string} file.mimetype - file mime type
   * @param {string} file.originalname - the original file name
   * @param {FileStream} file.stream - file stream to be uploaded
   * @param {function} cb - node-style callback
   * @private
   */
  _handleFile(
    req,
    {mimetype: mimeType, originalname: originalName, stream},
    cb
  ) {
    const fileMetadata = {
      name: originalName,
      mimeType,
      parents: [parentFolder],
      description: req.body.comment
    }

    this.drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: stream
      }
    },
    {
      // Workaround axios' issue of streams incorrect backpressuring, issue: https://github.com/googleapis/google-api-nodejs-client/issues/1107
      maxRedirects: 0
    }
    ).then(({data: {id: googleId, name: uploadFilename}}) => {
      cb(null, {googleId, uploadFilename})
    }).catch(error =>
      cb(error, null)
    )
  }

  /**
   * File remove handler, in case of an upload error.
   *
   * @param {IncomingMessage} req - express req object
   * @param {object} file - google file instance
   * @param {string} file.googleId - google file instance id
   * @param {function} cb - node-style callback
   * @private
   */
  _removeFile(req, {googleId: fileId}, cb) {
    this.drive.files.delete(
      {
        fileId
      },
      cb
    )
  }
}

module.exports = opts => new DriveStorage(opts)
