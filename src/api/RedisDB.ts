import { createClient } from 'redis';

export const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

// await client.set('key', 'value');
// const value = await client.get('key');
// console.debug({value})
// await client.disconnect();