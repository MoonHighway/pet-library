module.exports = {
  pet: (parent, args, { pets }) => pets.findOne({ id: parent.petId }),
  checkOutDate: parent => parent.checkoutDate,
  checkInDate: parent => parent.checkInDate,
  late(parent) {
    let date = new Date(parent.checkoutDate);
    let plusThree = date.getTime() + 3 * 60000;
    let dueString = new Date(plusThree).toISOString();

    return parent.checkInDate > dueString ? true : false;
  }
};
