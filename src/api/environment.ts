import { env } from "node:process";
export const GLOBAL_VARS = () => {
    if (!env['NODE_ENV']) { console.error('!NODE_ENV'); process.exit(1); }
    /*
    // Development Variables
    */
    if (env['NODE_ENV'].toUpperCase() !== 'PRODUCTION') {
        return {
            NODE_ENV: env['NODE_ENV'],

            MariaDB_Host: "localhost",
            MariaDB_Username: "app_user",
            MariaDB_Password: "password",

            RedisDB_Host: "localhost",
        };
    }


    /*
    // Production Variables
    */
    // MariaDB
    if (!env['MariaDB_Host']) { console.error('!MariaDB_Host'); process.exit(1); }
    if (!env['MariaDB_Username']) { console.error('!MariaDB_Username'); process.exit(1); }
    if (!env['MariaDB_Password']) { console.error('!MariaDB_Password'); process.exit(1); }

    // MongoDB
    if (!env['MongoDB_Username']) { console.error('!MongoDB_Username'); process.exit(1); }
    if (!env['MongoDB_Password']) { console.error('!MongoDB_Password'); process.exit(1); }
    if (!env['MongoDB_Host']) { console.error('!MongoDB_Host'); process.exit(1); }

    return {
        NODE_ENV: env['NODE_ENV'],

        MariaDB_Host: env['MariaDB_Host'],
        MariaDB_Username: env['MariaDB_Username'],
        MariaDB_Password: env['MariaDB_Password'],

        RedisDB_Host: env['RedisDB_Host'],
    };
}