module.exports = {
  petReturned: {
    subscribe: (parent, data, { pubsub }) =>
      pubsub.asyncIterator("pet-returned")
  }
};
