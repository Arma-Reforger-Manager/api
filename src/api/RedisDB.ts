import { createClient, RedisClientType } from 'redis';

// TESTING
import redis from 'redis';
import { GLOBAL_VARS } from './environment.js';
const client = redis.createClient({
	url: `redis://default:password@${GLOBAL_VARS().RedisDB_Host}:${GLOBAL_VARS().RedisDB_Port}`
})
await client.connect();
// const client = await createClient('3309')
// 	.on('error', err => console.log('Redis Client Error', err))
// 	.connect();
await client.setEx('test', 60, 'success');
console.debug({ testing: await client.get('test') })
await client.disconnect();
// END TESTING

export class RedisDB_Query {
	#connection: any | false;
	constructor() {
		this.#connection = false;
	}

	private async StartConnection() {
		this.#connection = await createClient({
			url: `redis://default:password@${GLOBAL_VARS().RedisDB_Host}:${GLOBAL_VARS().RedisDB_Port}`
		})
			.on('error', err => console.log('Redis Client Error', err))
			.connect();

		return Promise.resolve('Connected.');
	}
	getConnection(): Promise<RedisClientType<any>> {
		return new Promise(async (resolve, reject) => {
			if (this.#connection === false) await this.StartConnection();
			if (this.#connection !== false) resolve(this.#connection);
			else reject('Connection is false');
		})
	}
}