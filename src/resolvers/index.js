const { GraphQLScalarType } = require("graphql");
const bcrypt = require("bcrypt");
const { generate } = require("shortid");
const jwt = require("jsonwebtoken");

module.exports = {
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
    totalCustomers: (parent, args, { customers }) => customers.countDocuments(),
    allPets: async (parent, { category, status }, { pets, checkouts }) => {
      let allPetsArray = await pets.find().toArray();
      let categorizedPetsArray = await pets.find({ category }).toArray();
      let checkoutsArray = await checkouts.find().toArray();
      let checkoutIdsArray = checkoutsArray.map(pet => pet.petId);

      if (category && status === "CHECKEDOUT") {
        let checkedOutCategorizedPets = categorizedPetsArray.filter(pet =>
          checkoutIdsArray.includes(pet.id)
        );
        return checkedOutCategorizedPets;
      } else if (category && status === "AVAILABLE") {
        let availableCategorizedPets = categorizedPetsArray.filter(
          pet => !checkoutIdsArray.includes(pet.id)
        );
        return availableCategorizedPets;
      } else if (!category && status === "CHECKEDOUT") {
        let checkedOutAllPets = allPetsArray.filter(pet =>
          checkoutIdsArray.includes(pet.id)
        );
        return checkedOutAllPets;
      } else if (!category && status === "AVAILABLE") {
        let availableAllPets = allPetsArray.filter(
          pet => !checkoutIdsArray.includes(pet.id)
        );
        return availableAllPets;
      } else if (category && !status) {
        return categorizedPetsArray;
      } else {
        return allPetsArray;
      }
    },
    petById: (parent, { id }, { pets }) => pets.findOne({ id }),
    allCustomers: (parent, args, { customers }) => customers.find().toArray(),
    me: (parent, args, { currentCustomer }) => currentCustomer
  },
  Checkout: {
    pet: (parent, args, { pets }) => pets.findOne({ id: parent.petId }),
    checkOutDate: parent => parent.checkoutDate,
    checkInDate: parent => parent.checkInDate,
    late: parent => {
      let date = new Date(parent.checkoutDate);
      let plusThree = date.getTime() + 3 * 60000;
      let dueString = new Date(plusThree).toISOString();

      return parent.checkInDate > dueString ? true : false;
    }
  },
  Customer: {
    currentPets: async (parent, args, { pets, checkouts }) => {
      let allPetsArray = await pets.find().toArray();
      let checkedOutPetsArray = await checkouts
        .find({ username: parent.username })
        .toArray();
      let checkoutIdsArray = checkedOutPetsArray.map(pet => pet.petId);
      if (checkedOutPetsArray !== []) {
        let petList = allPetsArray.filter(pet =>
          checkoutIdsArray.includes(pet.id)
        );
        return petList;
      }
    }
  },
  Pet: {
    inCareOf: async (parent, args, { customers, checkouts }) => {
      let user = await checkouts.findOne({ petId: parent.id });
      if (user) {
        return customers.findOne({ username: user.username });
      } else {
        return null;
      }
    },
    status: async (parent, args, { checkouts }) => {
      let checkedOutPet = await checkouts.findOne({ petId: parent.id });
      return !checkedOutPet ? "AVAILABLE" : "CHECKEDOUT";
    },
    dueDate: async (parent, args, { checkouts }) => {
      let checkoutDate = await checkouts.findOne({ petId: parent.id });
      if (checkoutDate) {
        let date = new Date(checkoutDate.checkoutDate);
        let plusThree = date.getTime() + 3 * 60000;
        return new Date(plusThree).toISOString();
      } else {
        return null;
      }
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
          checkoutHistory: [],
          password: hash,
          dateCreated: new Date().toISOString()
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
        let checkout = {
          petId: id,
          username: currentCustomer.username,
          checkoutDate: new Date().toISOString()
        };

        await checkouts.replaceOne(checkout, checkout, {
          upsert: true
        });
        return {
          customer: await customers.findOne({
            username: currentCustomer.username
          }),
          pet: await pets.findOne({ id }),
          checkoutDate: checkout.checkoutDate
        };
      } else {
        throw new Error("This pet does not exist.");
      }
    },
    checkIn: async (
      parent,
      { id },
      { pets, customers, checkouts, currentCustomer }
    ) => {
      if (!currentCustomer) {
        throw new Error("You have to be logged in to check in a pet.");
      }
      let pet = await checkouts.findOne({ petId: id });
      if (!pet) {
        throw new Error("This pet is not checked out.");
      } else {
        await customers.updateOne(
          { id: currentCustomer.id },
          {
            $set: {
              checkoutHistory: [
                ...currentCustomer.checkoutHistory,
                { ...pet, checkInDate: new Date().toISOString() }
              ]
            }
          }
        );

        let checkinDate = await customers.findOne({ id: currentCustomer.id });
        let checkinArray = checkinDate.checkoutHistory;
        let lastCheckout = checkinArray[checkinArray.length - 1];

        let checkoutDateToChange = new Date(pet.checkoutDate);
        let plusThree = checkoutDateToChange.getTime() + 3 * 60000;
        let lateDate = new Date(plusThree).toISOString();

        let checkout = {
          pet: await pets.findOne({ id }),
          checkOutDate: pet.checkoutDate,
          checkInDate: lastCheckout.checkInDate,
          late: lastCheckout.checkInDate > lateDate ? true : false
        };

        await checkouts.deleteOne({ petId: id });

        return checkout;
      }
    }
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "A valid datetime value",
    serialize: value => new Date(value).toISOString(),
    parseValue: value => new Date(value),
    parseLiteral: ast => new Date(ast.value)
  })
};
