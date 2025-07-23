import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import resolvers from "./resolvers/index.js";

import customers from "./data/customers.json" assert { type: "json" };

import * as url from "url";
const __dirname = url.fileURLToPath(
  new URL(".", import.meta.url)
);

const typeDefs = readFileSync(
  path.join(__dirname, "typeDefs.graphql"),
  "utf-8"
);

const start = async () => {
  const context = async ({ req }) => {
    let currentCustomer = null;

    const token = req.headers.authorization
      ? req.headers.authorization.replace("Bearer ", "")
      : null;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.SECRET
        );
        currentCustomer = customers.find(
          (c) => c.username === decoded.username
        );
      } catch (e) {
        console.log("JWT error:", e.message);
      }
    }

    return { currentCustomer };
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
