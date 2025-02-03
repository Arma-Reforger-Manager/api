// Get the client
import mysql from 'mysql2/promise';

// Create the connection to database
import { GLOBAL_VARS } from './environment';
const connection = await mysql.createConnection({
    host: GLOBAL_VARS()['MariaDB_Host'] || 'localhost',
    user: GLOBAL_VARS()['MariaDB_Username'] || 'root',
    password: GLOBAL_VARS()['MariaDB_Password'] || 'root_password',
});

// A simple SELECT query
try {
    const [results, fields] = await connection.query(
        'SELECT CURRENT_TIME() as TIME;'
    );

    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
} catch (err) {
    console.log(err);
}