const mongo = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;
const config = require('./config.json');
// const config = reequire("./config.json");
const collectionName = "docs";

const fs = require("fs");
const path = require ("path");
const docs = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "reset.json")
))

const port = process.env.PORT || 1337;

const database = {
    getDb: async function getDb () {
        let dns = `mongodb+srv://${config.username}:${config.password}@cluster0.3ghzl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

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
    updateOneObject: async function updateOneObject(_id, doc) {
        db = await database.getDb();

        const filter = { _id: ObjectId(_id) };

        updateDoc = {
            $set: {
                name: doc.name,
                html: doc.html,
                date: doc.date
            }
        }

        options = { upsert: false };

        console.log(filter);

        const resultSet = await db.collection.updateOne(
            filter,
            updateDoc,
            options
        );

        await db.client.close();

        return resultSet;
    },
    deleteOneObject: async function deleteOneObject(_id) {
        db = await database.getDb();

        const query = { _id: ObjectId(_id) };

        const resultSet = await db.collection.findOneAndDelete(
            query
        );

        await db.client.close();

        return resultSet;
    }
};

module.exports = database;
