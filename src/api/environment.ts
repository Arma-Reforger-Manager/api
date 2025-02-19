import { env } from 'node:process';
export const GLOBAL_VARS = () => {
    if (!env['NODE_ENV']) { console.error('!NODE_ENV'); process.exit(1); }
    /*
    // Development Variables
    */
    if (env['NODE_ENV'].toUpperCase() !== 'PRODUCTION') {
        return {
            NODE_ENV: env['NODE_ENV'],
            IS_PRODUCTION: false,
            IS_DEVELOPMENT: true,

            MariaDB_Host: '127.0.0.1',
            MariaDB_Port: '3308',
            MariaDB_Username: 'app_user',
            MariaDB_Password: 'password',
            MariaDB_Database: 'reforger_manager_processed',

            MongoDB_Host: '127.0.0.1',
            MongoDB_Port: '3305',
            MongoDB_Username: 'mongodb_root_raw',
            MongoDB_Password: 'password',

            RedisDB_Host: '127.0.0.1',
            RedisDB_Port: '3309',
        };
    }


    /*
    // Production Variables
    */
    // MariaDB
    if (!env['MariaDB_Host']) { console.error('!MariaDB_Host'); process.exit(1); }
    if (!env['MariaDB_Port']) { console.error('!MariaDB_Port'); process.exit(1); }
    if (!env['MariaDB_Username']) { console.error('!MariaDB_Username'); process.exit(1); }
    if (!env['MariaDB_Password']) { console.error('!MariaDB_Password'); process.exit(1); }
    if (!env['MariaDB_Database']) { console.error('!MariaDB_Database'); process.exit(1); }

    // RedisDB
    if (!env['RedisDB_Host']) { console.error('!RedisDB_Host'); process.exit(1); }
    if (!env['RedisDB_Port']) { console.error('!RedisDB_Port'); process.exit(1); }

    // MongoDB
    if (!env['MongoDB_Host']) { console.error('!MongoDB_Host'); process.exit(1); }
    if (!env['MongoDB_Port']) { console.error('!MongoDB_Port'); process.exit(1); }
    if (!env['MongoDB_Username']) { console.error('!MongoDB_Username'); process.exit(1); }
    if (!env['MongoDB_Password']) { console.error('!MongoDB_Password'); process.exit(1); }

    return {
        NODE_ENV: env['NODE_ENV'],
        IS_PRODUCTION: true,
        IS_DEVELOPMENT: false,

        MariaDB_Host: env['MariaDB_Host'],
        MariaDB_Port: env['MariaDB_Port'],
        MariaDB_Username: env['MariaDB_Username'],
        MariaDB_Password: env['MariaDB_Password'],
        MariaDB_Database: env['MariaDB_Database'],

        MongoDB_Host: env['MongoDB_Host'],
        MongoDB_Port: env['MongoDB_Port'],
        MongoDB_Username: env['MongoDB_Username'],
        MongoDB_Password: env['MongoDB_Password'],

        RedisDB_Host: env['RedisDB_Host'],
        RedisDB_Port: env['RedisDB_Port'],
    };
}