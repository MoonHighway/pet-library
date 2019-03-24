module.exports = {
  petById: (parent, { id }, { pets }) => pets.findOne({ id }),
  allCustomers: (parent, args, { customers }) => customers.find().toArray(),
  me: (parent, args, { currentCustomer }) => currentCustomer,
  totalCustomers: (parent, args, { customers }) => customers.countDocuments(),
  async totalPets(parent, { status }, { pets, checkouts }) {
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
  async allPets(parent, { category, status }, { pets, checkouts }) {
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
  }
};
