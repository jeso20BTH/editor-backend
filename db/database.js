const mongo = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;
// const config = reequire("./config.json");
const collectionName = "docs";

const fs = require("fs");
const path = require ("path");
const docs = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "reset.json")
))

const database = {
    getDb: async function getDb () {
        let dns = `mongodb://localhost:27017/editor`;

        if (process.env.NODE_ENV === 'test') {
            dns = `mongodb://localhost:27017/test`
        }

        const client = await mongo.connect(dns, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = await client.db();
        const collection = await db.collection(collectionName);

        return {
            collection: collection,
            client: client
        };
    },
    resetDb: async function reset() {
        db = await database.getDb();

        await db.collection.deleteMany();
        await db.collection.insertMany(docs);

        await db.client.close();
    },
    findAll: async function findAll() {
        const db = await database.getDb();
        const resultSet = await db.collection.find({}).toArray();

        await db.client.close();

        return resultSet;
    },
    addOne: async function addOne(doc) {
        db = await database.getDb();

        const resultSet = await db.collection.insertOne(doc);

        await db.client.close();

        return resultSet;
    },
    updateOne: async function updateOne(_id, doc) {
        const filter = { _id: ObjectId(body["_id"]) };

        const result = await db.collection.updateOne(
            filter,
            doc,
        );
    }
};

module.exports = database;
