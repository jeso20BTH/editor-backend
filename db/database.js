const mongo = require("mongodb").MongoClient;

let config;
let username;
let password;

try {
    config = require('./config.json');
} catch (e) {
    console.log(e);
}

console.log(process.env.DBUSER);
username = process.env.DBUSER || config.username;
password = process.env.PASSWORD || config.password;



// const config = reequire("./config.json");
const collectionName = "users";

const database = {
    getDb: async function getDb() {
        let pre = 'mongodb+srv://';
        let credentials = `${username}:${password}`;
        let url = '@cluster0.3ghzl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
        let dns = `${pre}${credentials}${url}`;


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
    }
};

module.exports = database;
