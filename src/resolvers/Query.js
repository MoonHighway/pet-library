module.exports = {
  async totalPets(parent, args, { pets }) {
    return pets.countDocuments();
  },
  async availablePets(parent, args, { pets, checkouts }) {
    let totalPets = await pets.countDocuments();
    let totalCheckouts = await checkouts.countDocuments();
    return totalPets - totalCheckouts;
  },
  async checkedOutPets(parent, args, { checkouts }) {
    return checkouts.countDocuments();
  },
  allPets: (parent, args, { pets }) => {
    return pets.find().toArray();
  },
  allAvailablePets: async (parent, args, { pets, checkouts }) => {
    let allPetsArray = await pets.find().toArray();
    let checkoutsArray = await checkouts.find().toArray();
    let checkoutIdsArray = checkoutsArray.map(pet => pet.petId);
    let availableAllPets = allPetsArray.filter(
      pet => !checkoutIdsArray.includes(pet.id)
    );
    return availableAllPets;
  },
  allCheckedOutPets: async (parent, args, { pets, checkouts }) => {
    let allPetsArray = await pets.find().toArray();
    let checkoutsArray = await checkouts.find().toArray();
    let checkoutIdsArray = checkoutsArray.map(pet => pet.petId);
    let checkedOutAllPets = allPetsArray.filter(pet =>
      checkoutIdsArray.includes(pet.id)
    );
    return checkedOutAllPets;
  },
  petById: (parent, { id }, { pets }) => pets.findOne({ id }),
  familyPets: async (parent, args, { pets }) => {
    let allPetsArray = await pets.find().toArray();
    return allPetsArray.filter(pet => pet.good || pet.sleepAmount);
  },

  exoticPets: async (parent, args, { pets }) => {
    let allPetsArray = await pets.find().toArray();
    return allPetsArray.filter(pet => pet.fast || pet.favoriteFood);
  },

  totalCustomers: (parent, args, { customers }) => customers.countDocuments(),

  allCustomers: (parent, args, { customers }) => customers.find().toArray(),

  customersWithPets: async (parent, args, { checkouts, customers }) => {
    let checkoutsArray = await checkouts.find().toArray();
    let customersArray = await customers.find().toArray();
    let usernamesWithPets = [
      ...new Set(checkoutsArray.map(checkout => checkout.username))
    ];
    return customersArray.filter(customer =>
      usernamesWithPets.includes(customer.username)
    );
  },
  me: (parent, args, { currentCustomer }) => currentCustomer
};
