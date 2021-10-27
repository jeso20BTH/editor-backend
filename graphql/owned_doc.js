const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const CommentType = require('./comment');

const OwnedDocType = new GraphQLObjectType({
    name: 'OwnedDoc',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        html: { type: GraphQLNonNull(GraphQLString) },
        type: { type: GraphQLNonNull(GraphQLString) },
        date: { type: GraphQLNonNull(GraphQLString) },
        comments: {
            type: GraphQLList(CommentType) ,
            resolve: (doc) => {
                return doc.comments;
            }
        },
    })
})

module.exports = OwnedDocType;
