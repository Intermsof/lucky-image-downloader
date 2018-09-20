const EventEmitter = require('events');
const Readable = require('stream').Readable;
const readline = require('readline');
const https = require('https');
const http = require('http');

//Reads lines from payload, download the images into memory, and 
//emits 'image' events to be consumed in server. 
//Emits a 'close' event when a response (either completion or error)
//has been received for every line in the payload
module.exports = class Client extends EventEmitter{
    constructor(payload){
        super();
        const stream = new Readable();
        stream.push(payload);
        stream.push(null);
        const rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        let finishedReading = false;
        let inProgressCount = 0;
        rl.on('line', line => {
            inProgressCount += 1; //increment progress counter
            const commaPosition = line.indexOf(',');
            const filename = line.slice(0, commaPosition);
            const url = line.slice(commaPosition + 1).trim();
            let requester;
            if (url.startsWith('http://'))
                requester = http;
            else
                requester = https;

            let request = requester.request(url, res => {
                let data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    let buffer = Buffer.concat(data);
                    this.emitImage(url,buffer,filename);
                    inProgressCount -= 1; //decrement progress counter
                    if(inProgressCount === 0 && finishedReading)
                        this.emit('close');
                });
            });

            request.on('error',err => {
                console.log(`could not download ${filename} from ${url}: `, err.message);
                inProgressCount -= 1
                if(inProgressCount === 0 && finishedReading)
                    this.emit('close');
            });
            request.end();
        });

        rl.on('close', () => {
            finishedReading = true;
        });
    }

    emitImage(url,buffer,filename){
        this.emit('image',{
            url: url,
            filename: filename,
            buffer: buffer
        });
    }
}