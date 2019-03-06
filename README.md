
DOUP! Staff management backend
------------------------------

Stack used:

* node.js 8+
* Google Drive API

## Setup

1. Obtain GDrive service-to-service authentication keys (some steps [here](https://developers.google.com/api-client-library/python/auth/service-accounts)).
2. Setup .env file:
```
GOOGLE_APPLICATION_CREDENTIALS=\path\to\google-account-keys.json
DRIVE_PARENT_FOLDER='id of the gdrive folder where to put the files'
```
3. Run:
```
npm install
```

## Test
```
npm test
```

## Run
```
npm run
```
