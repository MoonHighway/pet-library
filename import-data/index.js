const { MongoClient } = require("mongodb");
const pets = require("./pets.json");
const customers = require("./customers.json");
const checkouts = require("./checkouts.json");

console.log(`

IMPORTING MONGODB DATA

`);

const importCollection = async (db, collectionName, data) => {
  try {
    console.log(`  creating ${collectionName} collection`);
    let collection = await db.createCollection(collectionName);
    console.log(`  importing ${data.length} ${collectionName}`);
    let results = await collection.insertMany(data);
    if (results.result.ok) {
      console.log(`  success ${results.result.n} ${collectionName} imported`);
    } else {
      console.log(`  Error importing ${collectionName}`);
      process.exit(1);
    }
  } catch (e) {
    console.log(`  error importing ${collectionName}`);
    console.log("  ERROR: ", e.message);
    process.exit(1);
  }
};

const start = async () => {
  let db;

  //
  // Make sure user has set environment variable
  //

  if (!process.env.MONGODB_URI) {
    console.log(`
      
Error: MONGODB_URI environment variable missing

Do you have a .env file?
Have you setup Environment variables?
      
      `);
    process.exit(1);
  }

  //
  // Connect to Mongo Database
  //

  try {
    console.log("connecting to ", process.env.MONGODB_URI);
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true
    });
    db = client.db();
  } catch (e) {
    console.log("error connection to mongodb at ", process.env.MONGODB_URI);
    console.log("ERROR: ", e.message);
    process.exit(1);
  }

  //
  // Drop all connections
  //

  console.log("\n\ndropping database collections");
  try {
    await db.collection("pets").drop();
  } catch (e) {}

  try {
    await db.collection("customers").drop();
  } catch (e) {}

  try {
    await db.collection("checkouts").drop();
  } catch (e) {}

  //
  // Import all collections
  //

  console.log("\n\nimporting data\n\n");
  await Promise.all([
    importCollection(db, "pets", pets),
    importCollection(db, "customers", customers),
    importCollection(db, "checkouts", checkouts)
  ]);

  console.log(`

DATA SUCCESSFULLY IMPORTED

`);

  process.exit(0);
};

start();
