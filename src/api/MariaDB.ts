import mysql from 'mysql2/promise';
import { GLOBAL_VARS } from './environment.js';

// TESTING
const connection = await mysql.createConnection({
    host: GLOBAL_VARS()['MariaDB_Host'],
    user: GLOBAL_VARS()['MariaDB_Username'],
    password: GLOBAL_VARS()['MariaDB_Password'],
    database: GLOBAL_VARS()['MariaDB_Database'],
    port: Number(GLOBAL_VARS()['MariaDB_Port'])
});
try {
    console.log(await connection.query(  'SELECT current_timestamp() as TIME;' ));
    connection.end();
} catch (err) {
    console.log(err);
}
// END TESTING

export class MariaDB_Query {
    private connection: mysql.Pool | false;
    constructor() {
        this.connection = false;
    }

    private connect(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                this.connection = mysql.createPool({
                    host: GLOBAL_VARS()['MariaDB_Host'],
                    user: GLOBAL_VARS()['MariaDB_Username'],
                    password: GLOBAL_VARS()['MariaDB_Password'],
                    database: GLOBAL_VARS()['MariaDB_Database'],
                    connectionLimit: 10,
                    port: Number(GLOBAL_VARS()['MariaDB_Port'])
                });
            } catch (error) {
                console.error({ error })
                return resolve(false);
            }

            if (GLOBAL_VARS().IS_DEVELOPMENT) console.log('Connection to SQL server.');
            resolve(true);
        });
    }

    async GetConnection(): Promise<mysql.Pool> {
        return new Promise(async (resolve, reject) => {
            if (this.connection === false) {
                const makeConnection = await this.connect();
                if (makeConnection === false) reject('makeConnection === false')
            }
            if (this.connection !== false)
                resolve(this.connection)
            else
                reject('this.#connection === false')
        })
    }
}

