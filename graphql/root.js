const ObjectId = require('mongodb').ObjectId;

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull
} = require('graphql');

const UserType = require('./user');
const DocumentType = require('./document');
const UserDocumentType = require('./user_document');
const CommentType = require('./comment');

users = require('./../models/userModel');

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        users: {
            type: GraphQLList(UserType),
            description: 'List all users',
            resolve: async function() {
                return await users.findAllUsers();
            }
        },
        user: {
            type: UserType,
            description: 'Query for user',
            args: {
                userId: { type: GraphQLString}
            },
            resolve: async (parent, args) => {
                let userArray = await users.findAllUsers();

                return userArray.find(user => user._id.equals(ObjectId(args.userId)));
            }
        },
        documents: {
            type: UserDocumentType,
            description: 'Query for documents of user',
            args: {
                userId: { type: GraphQLString}
            },
            resolve: async (parent, args) => {
                let userArray = await users.findAllUsers();

                let user = {};

                user.owner = userArray.find(user => user._id.equals(ObjectId(args.userId)));

                console.log(args.userId);
                allowedArray = [];

                userArray.map((user) => {
                    let userDocs = []
                    user.documents.map((doc) => {
                        let userDoc = {};

                        doc.allowed_users.map((allowed) => {
                            if(allowed._id.equals(ObjectId(args.userId))) {
                                userDoc = doc;
                            }
                        })

                        if (userDoc._id) {
                            userDocs.push(userDoc);
                        }
                    })

                    if (userDocs.length > 0) {
                        user.documents = userDocs;
                        allowedArray.push(user)
                    }
                })

                user.access = allowedArray

                return user;
            }
        },
        comments: {
            type: GraphQLList(CommentType),
            description: 'Get comments for document.',
            args: {
                userId: { type: GraphQLString},
                documentId: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                let userArray = await users.findAllUsers();

                let user = userArray.find(user => user._id.equals(ObjectId(args.userId)));

                console.log(user);

                console.log(args.documentId);

                let doc = user.documents.find(docu => docu._id.equals(ObjectId(args.documentId)));

                console.log(doc);

                return doc.comments;
            }
        }

    })
})

module.exports = RootQueryType;
