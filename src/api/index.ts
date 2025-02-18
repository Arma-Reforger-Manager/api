/*
    Databases
*/
let RedisDB: typeof import('./RedisDB.js');
try {
    console.log('Importing RedisDB')
    RedisDB = await import('./RedisDB.js')
} catch (error: any) {
    console.debug({ error })
    throw new Error("Failed to import RedisDB")
}

let MariaDB: typeof import('./MariaDB.js');
try {
    console.log('Importing MariaDB')
    MariaDB = await import('./MariaDB.js')
} catch (error: any) {
    console.debug({ error })
    throw new Error("Failed to import MariaDB")
}

let MongoDB: typeof import('./MongoDB.js');
try {
    console.log('Importing MongoDB')
    MongoDB = await import('./MongoDB.js')
} catch (error: any) {
    console.debug({ error })
    throw new Error("Failed to import MongoDB")
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
import { createServer, IncomingMessage, Server, ServerResponse } from "node:http"
import { createHash, randomBytes } from 'node:crypto';
import { GLOBAL_VARS } from './environment.js';
import { MDB_Document_HTTP } from './MongoDB.Interfaces.js';

let server: Server<any> = createServer().listen(81);

const headers = {
    'Access-Control-Allow-Origin': GLOBAL_VARS().IS_DEVELOPMENT ? 'https://manager.flabby.dev' : 'http://localhost:4200',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': 2592000, // 30 days
};

const Mongo = new MongoDB.MongoDB_Query();

async function ReadBody(req: IncomingMessage): Promise<any> {
    return new Promise((res, rej) => {
        let body = "";
        req.on('readable', function () {
            const read = req.read();
            if (read) body += read
        });
        req.on('end', function () {
            if (req.headers["content-type"] === 'application/json' && typeof body === 'string') {
                try {
                    const parsed = JSON.parse(body);
                    res(parsed)
                } catch (error) {
                    res(body)
                }
            } else res(body)
        })
    })
}

function EndHttp(response_variable: ServerResponse<any>, response_statusCode: number, response_body: string, response_headers: any, request_document_id: string, url: URL) {
    return new Promise(async (resolve, reject) => {
        let MongoData: MDB_Document_HTTP = {
            fullUrl: url.href,
            pathname: url.pathname,
            headers: response_headers,
            body: response_body,
            params: url.search,
            meta: {
                request_document_id
            }
        };
        const MongoHash = createHash('sha512').update(JSON.stringify(MongoData)).digest('base64');
        console.log( await Mongo.InsertHttpDocument('response', { ...MongoData, hash: MongoHash }))
        response_variable.writeHead(response_statusCode, response_headers).end(response_body);
        return resolve(true);
    });
}

async function CacheString(kay: string, value: string, timeInMiliseconds: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        const cacheClass = new RedisDB.RedisDB_Query();
        const cacheConnection = await cacheClass.getConnection();
       await cacheConnection.setEx(
            kay,
            timeInMiliseconds,
            value
        )

        return resolve(true);
    })
}

server.on("request", async (req: IncomingMessage, res) => {
    if (GLOBAL_VARS().NODE_ENV.toUpperCase() === 'DEVELOPMENT') console.debug({ method: req.method, url: req.url });

    // Make url from request
    const url = new URL(`http://flabby.dev${req.url}`);

    // Extract body or set to default, an empty json obj
    let body: any = {};
    try {
        body = await ReadBody(req);
    } catch (error: any) {
        console.error({ msg: 'Failed to read body on request', href: url.href, error })
        body = {}
    }

    // Store request in mongodb
    let MongoData: MDB_Document_HTTP = {
        fullUrl: url.href,
        pathname: url.pathname,
        headers: req.headers,
        params: url.search,
        body,
    };
    const MongoHash = createHash('sha512').update(JSON.stringify(MongoData)).digest('base64');
    const InsertedDoc = await Mongo.InsertHttpDocument('request', { ...MongoData, hash: MongoHash })

    if (req.method === 'OPTIONS') {
        return await EndHttp(res, 200, "OK", headers, InsertedDoc.insertedId.toHexString(), url);
    } else {
        switch (url.pathname) {
            case '/mod/token': {
                if (req.method === 'POST') {
                    // Collect inputted identifier from body
                    const token = body['identifier'];
                    const res_headers = { 'Content-Type': 'application/json', ...headers };
                    console.log({ body, token })
                    // Validate body
                    if (typeof token !== 'string') return await EndHttp(res, 400, JSON.stringify({ success: false }, null, 4), res_headers, InsertedDoc.insertedId.toHexString(), url);
                    // Check if 
                    const storageKey = `mod_token_${token}`;
                    const cacheData = JSON.stringify({ storageKey, identifier: token, headers: req.headers }, null, 4);
                    console.debug(cacheData)
                    const cacher = new RedisDB.RedisDB_Query();
                    const cache = await (await cacher.getConnection()).setEx(
                        storageKey,
                        60000,
                        cacheData
                    )
                    console.log(cache)

                    const res_body = JSON.stringify({ success: true }, null, 4)
                    const res_statusCode = 200;
                    return await EndHttp(res, res_statusCode, res_body, res_headers, InsertedDoc.insertedId.toHexString(), url);
                    break;
                }
                if (req.method === 'GET') {
                    // Collect inputted identifier from url's query param
                    const searchParams = url.searchParams;
                    const identifier = searchParams.get('identifier');
                    const res_headers ={ 'Content-Type': 'application/json', ...headers } ;
                    if (identifier === null) return await EndHttp(res, 400, JSON.stringify({ success: false }, null, 4), res_headers, InsertedDoc.insertedId.toHexString(), url);

                    // NOT DONE
                    // NOT DONE
                    // NOT DONE

                    //  Return true/false if valid identifier //

                    const res_body = JSON.stringify({ success: true, finished: false }, null, 4)
                    const res_statusCode = 200;
                    return await EndHttp(res, res_statusCode, res_body, res_headers, InsertedDoc.insertedId.toHexString(), url);
                }

                // Other HTTP Method(s) catcher
                return await EndHttp(res, 400, JSON.stringify({ success: true }, null, 4), { 'Content-Type': 'application/json', ...headers }, InsertedDoc.insertedId.toHexString(), url);
                break;
            }
            case '/log-in': { // WIP - Not priority
                try {
                    if (req.method) {
                        if (req.method === 'POST') {
                            // Create login jwt
                            // Create login jwt
                            // Create login jwt

                            const CurrentTime = new Date();
                            const ExpirationDate = CurrentTime.setDate(CurrentTime.getDate() + 7);

                            const dbId = randomBytes(12).toString('hex');
                            const token = jwt.sign({ databaseIdentifier: dbId, expires_at: ExpirationDate.valueOf() }, RSA_PRIVATE_KEY, { algorithm: 'PS256', expiresIn: '24h' });

                            // Caching - Storage of session token
                           const cache = CacheString(dbId, JSON.stringify({ test: true, token, expires_at: ExpirationDate.valueOf() }, null, 4), 129600); //1.5 days

                            // Send data to http client
                            const http_client_resposne = EndHttp(res, 200, JSON.stringify({ success: true, token, expiration_ms: ExpirationDate.valueOf() }, null, 4), headers, InsertedDoc.insertedId.toHexString(), url);

                            // Finish not-required promise(a)
                            return await Promise.all([
                                cache,
                                http_client_resposne
                            ]);
                        } else if (req.method === 'GET') {
                            // Verify login jwt
                            // Verify login jwt
                            // Verify login jwt
                            if (typeof req.headers.authorization !== 'string') return await EndHttp(res, 404, JSON.stringify({ success: false }, null, 4), headers, InsertedDoc.insertedId.toHexString(), url);

                            const verify = jwt.verify(req.headers.authorization, RSA_PUBLIC_KEY, { ignoreExpiration: false, maxAge: '2d' });
                            console.log(verify)
                            return await EndHttp(res, 200, JSON.stringify({ success: true, jwt: !!verify }, null, 4), headers, InsertedDoc.insertedId.toHexString(), url);
                        } else {
                            return await EndHttp(res, 404, JSON.stringify({ success: false }, null, 4), headers, InsertedDoc.insertedId.toHexString(), url);
                        }
                    }

                } catch (err: any) {
                    console.error({ err })
                    return await EndHttp(res, 500, JSON.stringify({ success: false }, null, 4), headers, InsertedDoc.insertedId.toHexString(), url);
                }

                break;
            }

            default:
                return await EndHttp(res, 404, JSON.stringify({ success: false }, null, 4), headers, InsertedDoc.insertedId.toHexString(), url);
                break;
        }
        return await EndHttp(res, 404, JSON.stringify({ success: false }, null, 4), headers, InsertedDoc.insertedId.toHexString(), url);
    }
})
