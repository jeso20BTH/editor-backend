const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const AllowedUserType = require('./allowed_user')

const DocumentType = new GraphQLObjectType({
    name: 'Doc',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        html: { type: GraphQLNonNull(GraphQLString) },
        allowed_users: {
            type: GraphQLList(AllowedUserType) ,
            resolve: (doc) => {
                return doc.allowed_users;
            }
        }
    })
})

module.exports = DocumentType;
