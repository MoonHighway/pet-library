const { ApolloServer } = require("apollo-server");
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const { generate } = require("shortid");
const jwt = require("jsonwebtoken");

const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");

const resolvers = {
  Query: {
    totalPets: async (parent, { status }, { pets, checkouts }) => {
      if (status === "AVAILABLE") {
        let totalPets = await pets.countDocuments();
        let totalCheckouts = await checkouts.countDocuments();
        return totalPets - totalCheckouts;
      } else if (status === "CHECKEDOUT") {
        return checkouts.countDocuments();
      } else {
        return pets.countDocuments();
      }
    },
    allPets: (parent, { category }, { pets }) => {
      if (category) {
        return pets.find({ category }).toArray();
      } else {
        return pets.find().toArray();
      }
    },
    availablePets: async (parent, args, { pets, checkouts }) => {},
    me: (parent, args, { currentCustomer }) => currentCustomer
  },
  Pet: {
    checkedOut: async (parent, args, { checkouts }) => {
      let checkedOutPet = await checkouts.findOne({ petId: parent.id });
      return checkedOutPet ? true : false;
    }
  },
  Mutation: {
    createAccount: async (
      parent,
      { input: { name, username, password } },
      { customers }
    ) => {
      let existingCustomer = await customers.findOne({ username });
      if (!existingCustomer) {
        let hash = bcrypt.hashSync(password, 10);
        let newCustomer = {
          id: generate(),
          name,
          username,
          currentPets: [],
          password: hash
        };
        await customers.insertOne(newCustomer);
        return newCustomer;
      } else {
        throw new Error("An account with this username already exists.");
      }
    },
    logIn: async (
      parent,
      { username, password },
      { customers, currentCustomer }
    ) => {
      let customer = await customers.findOne({ username });
      if (!customer) {
        throw new Error(`Account with that username: ${username} not found.`);
      }
      if (bcrypt.compareSync(password, customer.password)) {
        currentCustomer = customer;
        const token = jwt.sign(
          { username: currentCustomer.username },
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
    checkOut: async (
      parent,
      { id },
      { pets, customers, checkouts, currentCustomer }
    ) => {
      if (!currentCustomer) {
        throw new Error("You have to be logged in to check out a pet.");
      }
      let pet = await checkouts.findOne({ petId: id });
      let petExists = await pets.findOne({ id });
      if (pet) {
        throw new Error("Sorry, this pet is already checked out.");
      } else if (petExists) {
        let currentTime = new Date();
        let checkout = {
          petId: id,
          username: currentCustomer.username,
          dueDate: new Date(currentTime.getTime() + 3 * 60000).toISOString()
        };

        await checkouts.replaceOne(checkout, checkout, {
          upsert: true
        });
        return {
          customer: await customers.findOne({
            username: currentCustomer.username
          }),
          pet: await pets.findOne({ id }),
          dueDate: checkout.dueDate
        };
      } else {
        throw new Error("This pet does not exist.");
      }
    }
  }
};

const start = async () => {
  const client = await MongoClient.connect(process.env.DB_HOST, {
    useNewUrlParser: true
  });

  const db = client.db();

  const context = async ({ req }) => {
    const pets = db.collection("pets");
    const customers = db.collection("customers");
    const checkouts = db.collection("checkouts");
    let currentCustomer;
    const token = req.headers.authorization
      ? req.headers.authorization.replace("Bearer ", "")
      : null;

    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET);
      currentCustomer = await customers.findOne({ username: decoded.username });
    }

    return { pets, customers, checkouts, currentCustomer };
  };

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
