import { GLOBAL_VARS } from './environment.js';
import { Collection, Db, InsertOneResult, MongoClient } from 'mongodb';

// TESTING
const url = `mongodb://${GLOBAL_VARS().MongoDB_Username}:${GLOBAL_VARS().MongoDB_Password}@${GLOBAL_VARS().MongoDB_Host}:3305`;
const client = new MongoClient(url);

async function main() {
    const dbName = 'test_db';

    // Use connect method to connect to the server
    await client.connect();
    console.log('MongoDB - Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('test_cn');

    // the following code examples can be pasted here...
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    // console.log('Inserted documents =>', insertResult);

    // Find All Documents 
    const findResult = await collection.find({}).toArray();
    // console.log('Found documents =>', findResult);

    // Delete All Documents 
    console.debug({
        one: await collection.deleteMany({ a: 1 }),
        two: await collection.deleteMany({ a: 2 }),
        three: await collection.deleteMany({ a: 3 }),
        // msg: 'Deleted documents'
    })

    return 'MongoDB - done testing.';
}
main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
// END TESTING

import { MDB_Database, MDB_Document_HTTP } from './MongoDB.Interfaces.js'
export class MongoDB_Query {
    private Database = MDB_Database.api;
    private Client: MongoClient | null;
    private MongoDB: Db | null;
    private RequestCollection: Collection<any> | null;
    private ResponseCollection: Collection<any> | null;

    constructor() {
        this.Database = MDB_Database.api;
        this.Client = null;
        this.MongoDB = null;
        this.RequestCollection = null;
        this.ResponseCollection = null;
    }

    private async DatabaseConnecter(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const Host = GLOBAL_VARS()['MongoDB_Host'];
            const Password = GLOBAL_VARS()['MongoDB_Password'];
            const Username = GLOBAL_VARS()['MongoDB_Username'];
            this.Client = new MongoClient(`mongodb://${Username}:${Password}@${Host}:3305`);
            this.MongoDB = this.Client.db(this.Database);
            this.RequestCollection = this.MongoDB.collection('request');
            this.ResponseCollection = this.MongoDB.collection('response');
            resolve(true)
        });
    }

    public async GetQuery() {
        if (this.Client === null) await this.DatabaseConnecter();
        if (this.MongoDB === null) await this.DatabaseConnecter();

        return this.ResponseCollection!;
    }

    // Returns doucment's identifier
    public async InsertHttpDocument(collectionName: string, document: MDB_Document_HTTP): Promise<InsertOneResult<Document>> {
        return new Promise(async (resolve, reject) => {
            if (this.Client === null) await this.DatabaseConnecter();
            if (this.MongoDB === null) await this.DatabaseConnecter();

            let insertion_query;
            switch (collectionName) {
                case 'response': {
                    console.debug(collectionName, 222)
                    insertion_query = await this.ResponseCollection!.insertOne(document)
                    break;
                }
                
                case 'request': {
                    console.debug(collectionName, 111)
                    insertion_query = await this.RequestCollection!.insertOne(document)
                    break;
                }

                default:
                    break;
            }

            return resolve(insertion_query!);
        });
    }
}