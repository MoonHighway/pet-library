const { ApolloServer, PubSub } = require("apollo-server");
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const resolvers = require("./resolvers");
const path = require("path");

const typeDefs = readFileSync(
  path.join(__dirname, "typeDefs.graphql"),
  "UTF-8"
);

const start = async () => {
  const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/pet-library";
  console.log("connection to ", uri);
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true
  });

  const db = client.db();

  const pubsub = new PubSub();

  const context = async ({ req, connection }) => {
    const pets = db.collection("pets");
    const customers = db.collection("customers");
    const checkouts = db.collection("checkouts");
    let currentCustomer;
    let token;

    if (connection) {
      token = null;
    } else if (req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    } else {
      token = null;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.SECRET);
        currentCustomer = await customers.findOne({
          username: decoded.username
        });
      } catch (e) {
        console.log("context token error: ", e.message);
      }
    }

    return { pets, customers, checkouts, currentCustomer, pubsub };
  };

  const PORT = process.env.PORT || 4000;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
  });

  server
    .listen({ port: PORT })
    .then(({ port }) => console.log(`Server running at ${port}`));
};

start();
