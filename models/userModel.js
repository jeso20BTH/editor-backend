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
    findAllByFilter: async function(filter) {
        const db = await database.getDb();
        const resultSet = await db.collection.find(filter).toArray();

        await db.client.close();

        return resultSet;
    },
    addOneUser: async function(user) {
        const db = await database.getDb();

        const resultSet = await db.collection.insertOne(user);

        await db.client.close();;

        let counter = await userModel.newUserAddAccess({email: user.email, user: resultSet.insertedId});

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
                    type: req.body.type,
                    date: userModel.getDate(),
                    allowed_users: [],
                    invited_users: [],
                    comments: []
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
    newUserAddAccess: async function(data) {
        const db = await database.getDb();
        let accesscounter = 0;
        let documentCursor = await userModel.findAllByFilter({});
        let allDocuments = documentCursor;
        allDocuments.map(async (userOriginal) => {
            let changedUser = false;
            let userCopy = {};

            for (const [key, value] of Object.entries(userOriginal)) {
                if (!Array.isArray(value)) {
                    userCopy[key] = value;
                }
            }

            userCopy.documents = [];

            userOriginal.documents.forEach((doc) => {
                let invited = false;
                invitedUsersCopy = [];


                if (doc.invited_users.length > 0) {
                    doc.invited_users.forEach((invitedUser) => {
                        if (invitedUser.email === data.email) {
                            invited = true;
                        } else {
                            invitedUsersCopy.push( {email: invitedUser.email });
                        }
                    });

                    if (invited) {
                        doc.allowed_users.push({ _id: data.user });
                        changedUser = true;
                        accesscounter++;
                    }
                }

                doc.invited_users = invitedUsersCopy;

                userCopy.documents.push(doc);
            });

            if (changedUser) {
                let filter = { _id: userOriginal._id }

                await db.collection.updateOne(
                    filter,
                    { $set: userCopy}
                );
            }
        })

        return accesscounter;
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

        let documentFound = false;

        userCopy.documents = [];

        let userToAdd;

        if (req.body.allowed_users) {
            userToAdd = await userModel.findOneByFilter({email: req.body.allowed_users});

            if (!userToAdd) {
                userInvited = {email: req.body.allowed_users}
            }
        }

        userOriginal.documents.forEach((doc) => {
            if (ObjectId(req.body.documentId).equals(doc._id)) {
                documentFound = true
                doc.name = req.body.name || doc.name;
                doc.html = req.body.html || doc.html;
                doc.type = doc.type || req.body.type || 'text';
                doc.date = userModel.getDate();
                doc.invited_users = doc.invited_users || [];

                let includes = false;

                if (req.body.allowed_users) {
                    if (userToAdd) {
                        doc.allowed_users.map((id) => {
                            if (ObjectId(userToAdd._id).equals(id)) {
                                includes = true;
                            }
                        });

                        if (!includes) {
                            doc.allowed_users.push({ _id: userToAdd._id });
                        }
                    } else {
                        doc.invited_users.map((user) => {
                            if (user.email === userInvited.email) {
                                includes = true;
                            }
                        });

                        if (!includes) {
                            doc.invited_users.push(userInvited);
                        }
                    }

                }

                let commentsCopy = []

                if (req.body.comment) {
                    if (req.body.comment.crud === 'add') {
                        commentsCopy = doc.comments || [];

                        commentsCopy.push({
                            _id: new ObjectId(),
                            number: req.body.comment.number,
                            text: req.body.comment.text,
                            user: req.body.comment.user,
                            time: userModel.getDate()
                        });
                    } else if (req.body.comment.crud === 'update') {
                        doc.comments.map((comment) => {
                            if (comment._id.equals(ObjectId(req.body.comment._id))) {
                                comment.text = req.body.comment.text;
                                comment.time = userModel.getDate();
                                comment.user = req.body.comment.user;
                            }

                            commentsCopy.push(comment);
                        })
                    } else if (req.body.comment.crud === 'delete') {
                        doc.comments.map((comment) => {
                            if (!comment._id.equals(ObjectId(req.body.comment._id))) {
                                commentsCopy.push(comment);
                            }
                        })
                    }

                    doc.comments = commentsCopy;
                }
            }

            userCopy.documents.push(doc);
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

        res.status(204).json({message: 'Element deleted.'});
    },
    deleteUser: async function updateOneObject(req, res) {
        const db = await database.getDb();
        const filter = { email: req.body.email};
        const userOriginal = await db.collection.deleteOne(filter);

        res.status(204).json({message: 'Element deleted.'});
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
