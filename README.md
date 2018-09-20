# lucky-image-downloader
Takes in a csv, downloads images, and drops them into a SFTP

### Index.js
This contains the function for AWS Lambda

### Client.js
Reads lines from payload, download the images into memory, and emits 'image' events to be consumed in server. 
Emits a 'close' event when a response (either completion or error) has been received for every line in the payload.

### Server.js
Takes in a client (see client.js), and listens for 'image' and 'close' events from the client.
Opens a connection to the SFTP specified in env.json at the project root
Uploads images one by one and prints whether the upload was succesful or not.

### Tester.js 
A file to run for testing purposes

### env.json structure

```{
    "development":{
        "host": "My SFTP Host here",
        "username": "My SFTP username here",
        "password": "My SFTP password here",
        "sftpPath": "My SFTP path to upload to here"
    }
}
```
