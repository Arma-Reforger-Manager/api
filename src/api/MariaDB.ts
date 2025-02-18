import mysql from 'mysql2/promise';
import { GLOBAL_VARS } from './environment.js';

// TESTING
const connection = await mysql.createConnection({
    host: GLOBAL_VARS()['MariaDB_Host'] || 'localhost',
    user: GLOBAL_VARS()['MariaDB_Username'] || 'root',
    password: GLOBAL_VARS()['MariaDB_Password'] || 'root_password',
    database: GLOBAL_VARS()['MariaDB_Database'] || 'reforger_manager_processed',
    port: 3308
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
                    host: GLOBAL_VARS()['MariaDB_Host'] || 'localhost',
                    user: GLOBAL_VARS()['MariaDB_Username'] || 'root',
                    password: GLOBAL_VARS()['MariaDB_Password'] || 'root_password',
                    database: GLOBAL_VARS()['MariaDB_Database'] || 'reforger_manager_processed',
                    connectionLimit: 20,
                    enableKeepAlive: false,
                    idleTimeout:120000,
                    port: 3308
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

