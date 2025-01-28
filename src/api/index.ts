
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
let server = createServer().listen(81)

const headers = {
    'Access-Control-Allow-Origin': 'http://localhost',
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
        const body = await ReadBody(req)
        // console.debug(body)
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });

        switch (req.url) {
            case '/log-in': {
                let token;
                try {
                    token = jwt.sign({ databaseIdentifier: randomBytes(12) }, RSA_PRIVATE_KEY, { algorithm: 'PS256', expiresIn: '24h' });
                    // const verify = jwt.verify(token, RSA_PUBLIC_KEY, { ignoreExpiration: false, maxAge: '2d' });
                    // console.log(verify)
                } catch (err: any) {
                    console.error({ err })
                    return res.end(JSON.stringify({ success: false }));
                }

                return res.end(JSON.stringify({ success: true, jwt: token }));
                break;
            }

            default:
                return res.end(JSON.stringify({ success: false }));
                break;
        }
    }
})
