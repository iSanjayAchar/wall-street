import { MongoClient } from 'mongodb';
import { Config } from '../config';

const connection = new MongoClient(Config.database.mongodb.uri);

await connection.connect();

/**
 * This function lists all collections in the database and checks if 'price-points' exists
 * If the collection doesn't exists, it will create one
 */
const collections = (await connection.db(Config.database.mongodb.dbName).listCollections().toArray()).map((collection) => collection.name);
if (!collections.includes('price-points')) {
    await Init();
}

/**
 * Initializes the timeseries collection to be used later
 */
async function Init() {
    await connection.db(Config.database.mongodb.dbName).createCollection('price-points', {
        timeseries: {
            metaField: 'pair',
            timeField: 'timestamp',
            granularity: 'seconds',
        },
        expireAfterSeconds: 86400
    })
}

async function Write(
    pair = Config.pair.default,
    timestamp = new Date(),
    price = 0
) {
    try {
        await connection.db(Config.database.mongodb.dbName).collection('price-points').insertOne({
            pair, timestamp, price,
        });

        return Promise.resolve(true);
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

export {
    Write,
}