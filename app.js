const SAMPLE_FILE_URL = './data/marquitos.jpg'
const fileName = require('path').resolve(__dirname, SAMPLE_FILE_URL)
const client = require('./client/google-client')
const upload = require('./service/upload')

async function main() {
  const auth = await client.authenticate()

  // Do a googleapi call
  console.log('uploading file from path:', fileName)
  const data = await upload.run({fileName, auth})

  console.log(data)
}

main()
  .then(() => console.log('all done!'))
  .catch(error => console.error('ups...', error))
