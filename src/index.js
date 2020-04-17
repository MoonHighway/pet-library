const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const resolvers = require("./resolvers");
const path = require("path");
const restRoutes = require("./REST-API");
const cors = require("cors");

const typeDefs = readFileSync(
  path.join(__dirname, "typeDefs.graphql"),
  "UTF-8"
);

const start = async () => {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/pet-library";
  console.log("connection to ", uri);
  const client = await MongoClient.connect(uri, {
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
      try {
        const decoded = jwt.verify(
          token,
          process.env.SECRET
        );
        currentCustomer = await customers.findOne({
          username: decoded.username
        });
      } catch (e) {
        console.log("context token error: ", e.message);
      }
    }

    return { pets, customers, checkouts, currentCustomer };
  };

  const PORT = process.env.PORT || 4000;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    playground: true
  });

  const app = express();
  app.use(cors());
  app.use("/api", restRoutes(db.collection("pets")));
  server.applyMiddleware({ app, path: "/" });

  app.listen({ port: PORT }, () => {
    console.log(`Server running at ${PORT}`);
  });
};

start();
