
/*

 Schema contains all the data graphQL needs

 */


const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    desc: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(resp => resp.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User', // This property defines the type. Capitlized by convention
  /*
  *   This defines the fields to be fetched.
  *   It takes an object with f
  */
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(resp => resp.data);
      },
    },
  }),
});

// RootQuery is the entrypoint to our data
// All types defined needs to be put
// As fields in the  RootQuery
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      // the arguments required for this query (user)
      args: { id: { type: GraphQLString } },
      // database / server calls to grap data
      //
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data);
      },
    },
    users: {
      type: GraphQLList(UserType),
      args: {},
      resolve(parentValue, args) {
        console.log('adding user!');
        return axios.get('http://localhost:3000/users')
          .then(res => res.data);
      },
    },
    companies: {
      type: GraphQLList(CompanyType),
      args: {},
      resolve() {
        console.log('adding user!');
        return axios.get('http://localhost:3000/companies')
          .then(res => res.data);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        age: { type: new GraphQLNonNull(GraphQLInt) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        console.log('adding user!', args);
        return axios.post('http://localhost:3000/users', args)
          .then(res => res.data);
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`)
          .then(res => res.data);
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        firstName: { type: GraphQLString },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
          .then(res => res.data);
      },
    },
  },
});


// GraphQLSchema takes a rootQuery and returns a graphQLSchema
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
