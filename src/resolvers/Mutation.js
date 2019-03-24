const bcrypt = require("bcrypt");
const { generate } = require("shortid");
const jwt = require("jsonwebtoken");

module.exports = {
  async createAccount(
    parent,
    {
      input: { name, username, password }
    },
    { customers }
  ) {
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
  async logIn(parent, { username, password }, { customers, currentCustomer }) {
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
  async checkOut(
    parent,
    { id },
    { pets, customers, checkouts, currentCustomer }
  ) {
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
  async checkIn(
    parent,
    { id },
    { pets, customers, checkouts, currentCustomer }
  ) {
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
};
