const mongo = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;
let config;
let username;
let password;


try {
    config = require('./config.json');
} catch (e) {
    console.log(e);
}

username = process.env.USERNAME || config.username;
password = process.env.PASSWORD || config.password;

// const config = reequire("./config.json");
const collectionName = "docs";

const fs = require("fs");
const path = require ("path");
const docs = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "reset.json")
));

const database = {
    getDb: async function getDb() {
        let dns = `mongodb+srv://
        ${username}:${password}@cluster0.3ghzl.mongodb.net/
        myFirstDatabase?retryWrites=true&w=majority`;

        if (process.env.NODE_ENV === 'test') {
            dns = `mongodb://localhost:27017/test`;
        }

        const client = await mongo.connect(dns, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = await client.db();
        const collection = await db.collection(collectionName);

        return {
            db: db,
            collection: collection,
            client: client
        };
    },
    resetDb: async function reset() {
        let db = await database.getDb();

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
        const db = await database.getDb();

        const resultSet = await db.collection.insertOne(doc);

        await db.client.close();

        return resultSet;
    },
    updateOneObject: async function updateOneObject(_id, doc) {
        const db = await database.getDb();

        const filter = { _id: ObjectId(_id) };

        let updateDoc = {
            $set: {
                name: doc.name,
                html: doc.html,
                date: doc.date
            }
        };

        let options = { upsert: false };

        const resultSet = await db.collection.updateOne(
            filter,
            updateDoc,
            options
        );

        await db.client.close();

        return resultSet;
    },
    deleteOneObject: async function deleteOneObject(_id) {
        let db = await database.getDb();

        const query = { _id: ObjectId(_id) };

        const resultSet = await db.collection.findOneAndDelete(
            query
        );

        await db.client.close();

        return resultSet;
    }
};

module.exports = database;
