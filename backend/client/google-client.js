const {google} = require('googleapis')

class GoogleClient {
  /**
   *
   * @param {string|string[]} scopes - can be specified either as an array or as a single, space-delimited string.
   * @returns {Promise<Compute | JWT | UserRefreshClient>} - the auth entity for future requests
   */
  async authenticate(scopes = ['https://www.googleapis.com/auth/drive.file']) {
    // This method looks for the GCLOUD_PROJECT and/or GOOGLE_APPLICATION_CREDENTIALS
    // environment variables.
    const client = await google.auth.getClient({
      scopes
    })

    // Obtain the current project Id
    const project = await google.auth.getProjectId()
    console.log('google-project ID is:', project)

    return client
  }
}

module.exports = new GoogleClient()
