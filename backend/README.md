
DOUP! Staff management backend
------------------------------

Stack used:

* node.js 8+
* Google Drive API
* MongoDB

## Setup

1. Obtain GDrive service-to-service authentication keys (some steps [here](https://developers.google.com/api-client-library/python/auth/service-accounts)).
2. Setup .env file:
```
MONGODB_URL=mongodb://<user>:<password>@<host>:<port>/<db-name>
AUTH_TOKEN_SECRET='a random phrase for auth tokens generation'
GOOGLE_APPLICATION_CREDENTIALS=\path\to\google-account-keys.json
DRIVE_PARENT_FOLDER='id of the gdrive folder where to put the files'
GMAIL_SENDER_ACCOUNT='g suite mail sending account'
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

# API

```
POST /upload
```

Upload an image to drive.

---

```
POST /auth/register
{
 "username": "jdoe",
 "email": "me@example.com",
 "password": "mypassword"
}
```

Register a new user account.

---
