const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const OwnedDocType = require('./owned_doc');
const AccessUserType = require('./access_user')

const UserDocumentType = new GraphQLObjectType({
    name: 'UserDoc',
    description: 'This represents a document',
    fields: () => ({
        owner: {
            type: GraphQLList(OwnedDocType) ,
            resolve: (doc) => {
                return doc.owner.documents;
            }
        },
        access: {
            type: GraphQLList(AccessUserType) ,
            resolve: (doc) => {
                return doc.access;
            }
        }
    })
})

module.exports = UserDocumentType;
