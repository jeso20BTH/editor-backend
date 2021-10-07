const ObjectId = require('mongodb').ObjectId;

let database = require('./../db/database');

const fs = require("fs");
const path = require ("path");
const resetData = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "./../db/reset.json")
));

const userModel = {
    getDate: function() {
        let today = new Date();
        let y = today.getFullYear();
        let m = today.getMonth() + 1;
        let d = today.getDate();
        let h = today.getHours();
        let mm = today.getMinutes();
        let s = today.getSeconds();

        if (m < 10) {
            m = `0${m}`;
        }

        if (d < 10) {
            d = `0${d}`;
        }

        if (h < 10) {
            h = `0${h}`;
        }

        if (mm < 10) {
            mm = `0${mm}`;
        }

        if (s < 10) {
            s = `0${s}`;
        }

        return `${y}-${m}-${d} ${h}:${mm}:${s}`;
    },
    findAllUsers: async function(req, res=undefined) {
        const db = await database.getDb();
        const resultSet = await db.collection.find({}).toArray();

        await db.client.close();

        if (res === undefined) {
            return resultSet;
        }

        allowedArray = [];

        resultSet.map((user) => {
            let userDocs = []
            user.documents.map((doc) => {
                let userDoc = {};

                doc.allowed_users.map((allowed) => {
                    if(allowed._id.equals(ObjectId('6157581b445d27b9f65cb5dd'))) {
                        console.log("Im equal");
                        userDoc = doc;
                    }
                })

                if (userDoc._id) {
                    console.log('Im in');
                    userDocs.push(userDoc);
                }
            })

            if (userDocs.length > 0) {
                user.documents = userDocs;
                allowedArray.push(user)
            }
        })

        return res.json(resultSet);
    },
    findAllDocumentsForUser: async function(req, res) {
        const db = await database.getDb();

        const resultSet = await db.collection.find(
            { $or:
                [
                    {_id: ObjectId(req.body._id)},
                    {'documents.allowed_users._id': ObjectId(req.body._id)}
                ]
            }
        ).toArray();

        let documents = {
            owner: [],
            access: []
        };

        resultSet.map(function(user) {
            if (user._id.equals(ObjectId(req.body._id))) {
                user.documents.map(function(document) {
                    documents.owner.push(document);
                });
            } else  {
                user.documents.map(function(document) {
                    let allowed = document.allowed_users.map(function(allowedUser) {
                        if (allowedUser._id.equals(ObjectId(req.body._id))) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    if (allowed.includes(true)) {
                        document.owner = user._id;
                        documents.access.push(document);
                    }
                });
            }
        });

        await db.client.close();

        res.json(documents);
    },
    findOneByFilter: async function(filter) {
        const db = await database.getDb();
        const resultSet = await db.collection.findOne(filter);

        await db.client.close();

        return resultSet;
    },
    addOneUser: async function(user) {
        const db = await database.getDb();

        const resultSet = await db.collection.insertOne(user);

        await db.client.close();

        return resultSet;
    },
    addOneDocument: async function addOneDocument(req, res) {
        let documentId = new ObjectId();
        const db = await database.getDb();

        const resultSet = await db.collection.updateOne({
            _id: ObjectId(req.body._id)
        }, {
            $push: {
                'documents': {
                    _id: documentId,
                    name: req.body.name,
                    html: req.body.html,
                    date: userModel.getDate(),
                    allowed_users: []
                }
            }
        });

        await db.client.close();

        if (resultSet.modifiedCount > 0) {
            return res.status(201).json({
                message: 'New document added',
                _id: documentId
            });
        }
    },
    updateOneDocument: async function updateOneObject(req, res) {
        const db = await database.getDb();
        const filter = { _id: ObjectId(req.body._id)};


        const userOriginal = await userModel.findOneByFilter(filter);
        let userCopy = {};

        for (const [key, value] of Object.entries(userOriginal)) {
            if (!Array.isArray(value)) {
                userCopy[key] = value;
            }
        }

        userCopy.documents = [];

        let userToAdd;

        if (req.body.allowed_users) {
            userToAdd = await userModel.findOneByFilter({email: req.body.allowed_users});
        }

        userOriginal.documents.forEach((document) => {
            if (ObjectId(req.body.documentId).equals(document._id)) {
                document.name = req.body.name || document.name;
                document.html = req.body.html || document.html;
                document.date = userModel.getDate();
                let includes = false;

                if (req.body.allowed_users) {
                    document.allowed_users.map((id) => {
                        if (id.equals(userToAdd._id)) {
                            includes = true;
                        }
                    });

                    if (!includes) {
                        document.allowed_users.push({ _id: userToAdd._id });
                    }
                }
            }

            userCopy.documents.push(document);
        });

        let resultSet = await db.collection.updateOne(
            filter,
            { $set: userCopy}
        );

        await db.client.close();

        return res.status(204).json(resultSet);
    },
    deleteOneDocument: async function updateOneObject(req, res) {
        const db = await database.getDb();
        const filter = { _id: ObjectId(req.body._id)};
        const userOriginal = await userModel.findOneByFilter(filter);
        let userCopy = {};

        for (const [key, value] of Object.entries(userOriginal)) {
            if (!Array.isArray(value)) {
                userCopy[key] = value;
            }
        }

        userCopy.documents = [];

        userOriginal.documents.forEach((document) => {
            if (!ObjectId(req.body.documentId).equals(document._id)) {
                userCopy.documents.push(document);
            }
        });

        await db.collection.updateOne(
            filter,
            { $set: userCopy}
        );

        await db.client.close();

        return await res.status(204).json(userModel.findAllDocumentsForUser(req, res));
    },
    resetData: async function(req, res) {
        resetData.forEach((user) => {
            user.documents.forEach((document) => {
                document._id = new ObjectId();
                document.date = userModel.getDate();
            });
        });

        let db = await database.getDb();

        await db.collection.deleteMany();
        await db.collection.insertMany(resetData);

        await db.client.close();

        res.redirect('/db');
    }
};

module.exports = userModel;
