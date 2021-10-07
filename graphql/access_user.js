const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const AccessDocType = require('./access_doc')

const AccessUserType = new GraphQLObjectType({
    name: 'AccessUser',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        documents: {
            type: GraphQLList(AccessDocType) ,
            resolve: (access) => {
                return access.documents;
            }
        }
    })
})

module.exports = AccessUserType;
