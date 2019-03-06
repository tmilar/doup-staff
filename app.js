const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '.env')})
const config = require('./config')
const client = require('./client/google-client')
const upload = require('./service/upload')

async function main() {
  // First authenticate
  const auth = await client.authenticate()

  // Define file data
  const sampleFileUrl = './data/marquitos.jpg'
  const filePath = path.resolve(__dirname, sampleFileUrl)

  console.log('uploading file from path:', filePath)

  const fileMetadata = {
    name: `${new Date().toISOString()}_garkos.jpg`,
    description: 'foto muy piola',
    parents: [config.drive.parentFolder]
  }

  // Upload the file
  const data = await upload.run({filePath, fileMetadata, auth})

  console.log(data)
}

main()
  .then(() => console.log('all done!'))
  .catch(error => console.error('ups...', error))
