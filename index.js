const Server = require('./src/server');
const Client = require('./src/client');

//AWS Handler
exports.handler = async (event) => {
    return new Promise((resolve,reject)=>{
        const client = new Client(event.body);
        const server = new Server(client);

        server.on('resolve',()=>{
            resolve();
        });

        server.on('reject',()=>{
            reject();
        });
    })  
};

