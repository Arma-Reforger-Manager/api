/*
    Databases
*/
let RedisDB: typeof import('./RedisDB.js');
try {
    console.log('Importing RedisDB')
    RedisDB = await import('./RedisDB.js')
} catch (error: any) {
    console.debug({error})
    throw new Error("Failed to import RedisDB")
}
let MariaDB: typeof import('./MariaDB.js');
try {
    console.log('Importing MariaDB')
    MariaDB =  await import('./MariaDB.js')
} catch (error: any) {
    console.debug({error})
    throw new Error("Failed to import MariaDB")
}

/*
    JWT

    # Build Docker image
        docker build -t docker-openssl:latest .
    # Run container
        docker run -it --rm -v "./:/openssl-certs" docker-openssl:latest
    # Generate private key
        openssl genrsa -out rsa.private 2048
    # Generate corresponding public key
        openssl rsa -in rsa.private -out rsa.public -pubout -outform PEM
*/
import jwt from 'jsonwebtoken';
import fs from "fs";
const RSA_PRIVATE_KEY = fs.readFileSync('certs/rsa.private');
const RSA_PUBLIC_KEY = fs.readFileSync('certs/rsa.public');


/*
    HTTP Server
*/
import { createServer, IncomingMessage } from "node:http"
import { randomBytes } from 'node:crypto';
import { isObject } from 'node:util';
import { GLOBAL_VARS } from './environment.js';
let server = createServer().listen(81)

const headers = {
    'Access-Control-Allow-Origin': GLOBAL_VARS().NODE_ENV === 'PRODUCTION' ? 'https://manager.flabby.dev' : 'http://localhost',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': 2592000, // 30 days
};

async function ReadBody(req: IncomingMessage) {
    return new Promise((res, rej) => {
        let body = "";
        req.on('readable', function () {
            const read = req.read();
            if (read) body += read
        });
        req.on('end', function () {
            res(body)
        })
    })
}

server.on("request", async (req, res) => {
    console.log({ method: req.method, url: req.url, ...req.headers });

    if (req.method === 'OPTIONS') {
        res.writeHead(200, { ...headers });
        res.end();
    } else {
        // const body = await ReadBody(req)
        // console.debug(body)
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });

        switch (req.url) {
            case '/log-in': { // WIP - Not priority
                try {
                    if (req.method) {
                        if (req.method === 'POST') {
                            // Create login jwt
                            const dbId = randomBytes(12).toString('hex');
                            const token = jwt.sign({ databaseIdentifier:  dbId}, RSA_PRIVATE_KEY, { algorithm: 'PS256', expiresIn: '24h' });
                            await RedisDB.client.setEx(dbId, 86400, JSON.stringify({test: true}, null,  4)); //1 day
                            return res.end(JSON.stringify({ success: true, jwt: token }));
                        } else if (req.method === 'GET') {
                            // Verify login jwt
                            if (typeof req.headers.authorization !== 'string') return res.end(JSON.stringify({ success: false }));

                            const verify = jwt.verify(req.headers.authorization, RSA_PUBLIC_KEY, { ignoreExpiration: false, maxAge: '2d' });
                            console.log(verify)
                        } else {

                        }
                    }
                    
                } catch (err: any) {
                    console.error({ err })
                    return res.end(JSON.stringify({ success: false }));
                }

                break;
            }

            default:
                return res.end(JSON.stringify({ success: false }));
                break;
        }
    }
})
