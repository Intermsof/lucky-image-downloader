const EventEmitter = require('events');
const env = require('../env.json')[process.env.NODE_ENV || 'development'];
const SFTP = require('ssh2-sftp-client');

//Takes in a client (see client.js), and listens for 'image' and 'close'
//events from the client.
//Opens a connection to the SFTP specified in env.json at the project root
//Uploads images one by one and prints whether the upload was succesful or not.
module.exports = class Server extends EventEmitter {
    constructor(client){
        super();
        //Initialize an empty queue of images to upload
        this.queue = [];
        //Get an instance of SFTP 
        this.sftp = new SFTP();
        this.openConnection();
        console.log('using env variables: ', env);
        client.on('image', payload => {
            this.queue.push(payload);
            this.consume();
        });

        client.on('close', ()=>{
            this.noMoreInput = true;
        })
    }

    openConnection(){
        this.sftp.connect({
            host: env.host,
            username: env.username,
            password: env.password
        }).then(()=>{
            this.connectionOpen = true;
            this.consume()
        },err=>{
            console.log('error completing: ', err);
            this.closeConnection(true);
        });
    }

    consume(){
        if(this.queue.length === 0 && this.noMoreInput){
            this.closeConnection();
        }

        if(this.queue.length > 0 && !this.busy && this.connectionOpen){
            let payload = this.queue.pop();
            this.upload(payload);
        }
    }

    upload(payload){
        this.busy = true;
        this.sftp.put(payload.buffer,this.getPath(payload.filename))
            .then(()=>{
                this.busy = false;
                console.log(`uploaded ${payload.filename} from ${payload.url}`);
                this.consume();
            },err => {
                console.log('error uploading: ', err);
                this.closeConnection(true);
            })
    }

    getPath(filename){
        return `${env.sftpPath}${filename}`;
    }

    closeConnection(error = false){
        this.sftp.end();
        if (error){
            console.log('disconnectted from sftp due to error');
            this.emit('reject');
        }
        else{
            console.log('Successfully uploaded all files, disconnectted from sftp.');
            this.emit('resolve');
        }

    }
}

// client.put(buffer, `TEST/alexImages/${fileName}`).then(() => {
//     console.log('successfully uploaded ', fileName);
//     remaining--;
//     if (remaining === 0 && closed) {
//         console.log('closing connection');
//         client.end();
//         resolve({
//             statusCode: 200,
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: reqCopy || "rip",
//             isBase64Encoded: false
//         });
//     }
// }, err=>{
    
//     console.log('error: ', err);
//     client.end();
// });


// if (remaining === 0) {
//     client.end();
//     resolve({
//         statusCode: 200,
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: reqCopy || "rip",
//         isBase64Encoded: false
//     });
// }