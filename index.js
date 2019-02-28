const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  scalar PhoneNumber

  interface Pet {
    id: ID!
    name: String!
    weight: Int
    photo: Photo
    email: String
    type: PetCategory
    checkedOut: Boolean!
  }

  type Cat implements Pet {
    id: ID!
    name: String!
    weight: Int
    photo: Photo
    email: String
    type: PetCategory
    checkedOut: Boolean!
    dailySleep: Int!
  }

  type Dog implements Pet {
    id: ID!
    name: String!
    weight: Int
    photo: Photo
    email: String
    type: PetCategory
    checkedOut: Boolean!
    goodDog: Boolean!
  }

  type Snake implements Pet {
    id: ID!
    name: String!
    weight: Int
    photo: Photo
    email: String
    type: PetCategory
    checkedOut: Boolean!
    favoriteBook: String
  }

  type Bird implements Pet {
    id: ID!
    name: String!
    weight: Int
    photo: Photo
    email: String
    type: PetCategory
    checkedOut: Boolean!
    talks: Boolean!
  }

  type Stingray implements Pet {
    id: ID!
    name: String!
    weight: Int
    photo: Photo
    email: String
    type: PetCategory
    checkedOut: Boolean!
    mad: Boolean!
  }

  enum PetCategory {
    CAT
    DOG
    SNAKE
    BIRD
    STINGRAY
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
    checkedOut: [Pet!]!
    lateFees: Int
  }

  union RandomPet = Cat | Dog | Snake | Bird | Stingray

  type Query {
    totalPets(checkedOut: Boolean): Int!
    allPets(type: PetCategory): [Pet!]!
    myPets: [Pet!]!
    petByName(name: String!): Pet!
    totalCustomers: Int!
    customerById(id: ID!): Customer!
    whoCheckedTheDogsOut: [Customer!]!
  }

  type Mutation {
    login(username: String, password: String): Boolean
    checkIn(id: ID!): Pet!
    checkOut(id: ID!): Pet!
    causeChaoticAnimalParty(petCount: Int!): [RandomPet!]!
  }
`;

const server = new ApolloServer({
  typeDefs,
  mocks: true
});

server.listen().then(({ url }) => console.log(`Server running at ${url}`));
