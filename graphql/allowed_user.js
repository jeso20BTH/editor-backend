const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const AllowedUserType = new GraphQLObjectType({
    name: 'AllowedUser',
    description: 'This represents a allowedUser',
    fields: () => ({
        _id: {type: GraphQLNonNull(GraphQLString)}
    })
})

module.exports = AllowedUserType;
