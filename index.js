const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  scalar PhoneNumber

  interface Pet {
    name: String!
    weight: Int
    photo: Photo
    isCheckedOut: Boolean!
    checkoutHistory: [Customer!]!
  }

  type Cat implements Pet {
    name: ID!
    weight: Int
    photo: Photo
    isCheckedOut: Boolean!
    dailySleep: Int!
  }

  type Dog implements Pet {
    name: ID!
    weight: Int
    photo: Photo
    isCheckedOut: Boolean!
    goodDog: Boolean!
  }

  type Snake implements Pet {
    name: ID!
    weight: Int
    photo: Photo
    isCheckedOut: Boolean!
    poisonous: Boolean
  }

  type Mouse implements Pet {
    name: ID!
    weight: Int
    photo: Photo
    isCheckedOut: Boolean!
    squeaky: Boolean!
  }

  type Stingray implements Pet {
    name: ID!
    weight: Int
    photo: Photo
    isCheckedOut: Boolean!
    chill: Boolean!
  }

  type Photo {
    full: String!
    thumb: String!
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    phone: PhoneNumber
    petsCheckedOut: [Pet!]!
  }

  type Query {
    totalPets(checkedOut: Boolean): Int!
    allPets: [Pet!]!
    myPets: [Pet!]!
    petByName(name: ID!): Pet!
    totalCustomers: Int!
    customerById(id: ID!): Customer!
  }

  type Mutation {
    createAccount(username: String, password: String): Customer
    checkIn(name: ID!): Pet!
    checkOut(name: ID!): Pet!
  }

  type Subscription {
    petCheckedIn: Pet!
  }
`;

const server = new ApolloServer({
  typeDefs,
  mocks: true
});

server.listen().then(({ url }) => console.log(`Server running at ${url}`));
