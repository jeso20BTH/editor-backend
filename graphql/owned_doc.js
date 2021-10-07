const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const OwnedDocType = new GraphQLObjectType({
    name: 'OwnedDoc',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        html: { type: GraphQLNonNull(GraphQLString) }
    })
})

module.exports = OwnedDocType;
