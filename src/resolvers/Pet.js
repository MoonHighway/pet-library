export default {
  async inCareOf(parent, args, { customers, checkouts }) {
    let user = await checkouts.findOne({
      petId: parent.id,
    });
    if (user) {
      return customers.findOne({ username: user.username });
    } else {
      return null;
    }
  },
  async status(parent, args, { checkouts }) {
    let checkedOutPet = await checkouts.findOne({
      petId: parent.id,
    });
    return !checkedOutPet ? "AVAILABLE" : "CHECKEDOUT";
  },
};
