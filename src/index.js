import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import path from "path";
import restRoutes from "./REST-API.js";
import jwt from "jsonwebtoken";
import resolvers from "./resolvers/index.js";
import { MongoClient, ServerApiVersion } from "mongodb";

import * as url from "url";
const __dirname = url.fileURLToPath(
  new URL(".", import.meta.url)
);

const typeDefs = readFileSync(
  path.join(__dirname, "typeDefs.graphql"),
  "UTF-8"
);

const start = async () => {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/pet-library";

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  const context = async ({ req }) => {
    const pets = await client.db("pets").collection("pets");
    const customers = await client
      .db("pets")
      .collection("customers");
    const checkouts = await client
      .db("checkouts")
      .collection("checkouts");
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
          username: decoded.username,
        });
      } catch (e) {
        console.log("context token error: ", e.message);
      }
    }

    return { pets, customers, checkouts, currentCustomer };
  };

  const PORT = process.env.PORT || 4000;

  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    context,
    listen: { port: PORT },
  });
  console.log(`Server running at ${url}`);
};

start();
