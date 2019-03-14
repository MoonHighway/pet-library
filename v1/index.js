const { ApolloServer } = require("apollo-server");
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const { generate } = require("shortid");
const jwt = require("jsonwebtoken");

const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");

const resolvers = {
  Query: {
    totalPets: (parent, args, { pets }) => pets.countDocuments(),
    allPets: (parent, args, { pets }) => pets.find().toArray(),
    me: (parent, args, { currentCustomer }) => currentCustomer
  },
  Mutation: {
    createAccount: async (
      parent,
      { input: { name, email, password } },
      { customers }
    ) => {
      let existingCustomer = await customers.findOne({ email });
      if (!existingCustomer) {
        let hash = bcrypt.hashSync(password, 10);
        let newCustomer = {
          id: generate(),
          name,
          email,
          currentPets: [],
          password: hash
        };
        await customers.insertOne(newCustomer);
        return newCustomer;
      } else {
        throw new Error("An account with this email address already exists.");
      }
    },
    logIn: async (
      parent,
      { email, password },
      { customers, currentCustomer }
    ) => {
      let customer = await customers.findOne({ email });
      if (!customer) {
        throw new Error(`Account with email: ${email} not found.`);
      }
      if (bcrypt.compareSync(password, customer.password)) {
        currentCustomer = customer;
        const token = jwt.sign(
          { email: currentCustomer.email },
          process.env.SECRET
        );
        currentCustomer.token = token;
        return {
          customer: currentCustomer,
          token
        };
      } else {
        throw new Error("Incorrect password.");
      }
    },
    checkOut: async (parent, args, { pets, customers, currentCustomer }) => {
      let petsArray = args.pets.map(async pet => {
        if (pets.findOne({ name: pet })) {
          let foundCustomer = await customers.replaceOne(
            {
              id: currentCustomer.id
            },
            {
              ...currentCustomer,
              currentPets: currentCustomer.currentPets.push(pet)
            },
            { upsert: true }
          );
          console.log(foundCustomer.ops);
        }
      });

      Promise.all(petsArray).then(console.log);
    }
  }
};

const start = async () => {
  const client = await MongoClient.connect(process.env.DB_HOST, {
    useNewUrlParser: true
  });

  const context = async ({ req }) => {
    const pets = db.collection("pets");
    const customers = db.collection("customers");
    let currentCustomer;
    const token = req ? req.headers.authorization.replace("Bearer ", "") : null;

    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET);
      currentCustomer = await customers.findOne({ email: decoded.email });
    }

    return { pets, customers, currentCustomer };
  };

  const db = client.db();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    mocks: true,
    mockEntireSchema: false
  });

  server.listen().then(({ url }) => console.log(`Server running at ${url}`));
};

start();
