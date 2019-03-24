module.exports = {
  async currentPets(parent, args, { pets, checkouts }) {
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
};
