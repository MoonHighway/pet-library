module.exports = {
  pet: ({ petId }, args, { pets }) => pets.findOne({ id: petId }),
  late: ({ checkOutDate, checkInDate }) => {
    let date = new Date(checkOutDate);
    let plusThree = date.getTime() + 3 * 60000;
    let dueString = new Date(plusThree).toISOString();
    return checkInDate > dueString ? true : false;
  }
};
