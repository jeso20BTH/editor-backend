const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const AccessDocType = new GraphQLObjectType({
    name: 'AllowedDoc',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        html: { type: GraphQLNonNull(GraphQLString) }
    })
})

module.exports = AccessDocType;
