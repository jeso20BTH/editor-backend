const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const DocumentType = require('./document')

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user.',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        documents: {
            type: GraphQLList(DocumentType),
            resolve: (user) => {
                return user.documents
            }
        }
    })
})

module.exports = UserType;
