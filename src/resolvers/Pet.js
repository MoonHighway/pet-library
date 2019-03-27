module.exports = {
  async inCareOf(parent, args, { customers, checkouts }) {
    let user = await checkouts.findOne({ petId: parent.id });
    if (user) {
      return customers.findOne({ username: user.username });
    } else {
      return null;
    }
  },
  async status(parent, args, { checkouts }) {
    let checkedOutPet = await checkouts.findOne({ petId: parent.id });
    return !checkedOutPet ? "AVAILABLE" : "CHECKEDOUT";
  },
  async dueDate(parent, args, { checkouts }) {
    let checkoutDate = await checkouts.findOne({ petId: parent.id });
    if (checkoutDate) {
      let date = new Date(checkoutDate.checkoutDate);
      let plusThree = date.getTime() + 3 * 60000;
      return new Date(plusThree).toISOString();
    } else {
      return null;
    }
  },
  __resolveType: parent => {
    if (parent.curious) {
      return "Cat";
    } else if (parent.good) {
      return "Dog";
    } else if (parent.floppy) {
      return "Rabbit";
    } else {
      return "Stingray";
    }
  }
};
