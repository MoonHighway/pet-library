import pets from "../data/pets.json" assert { type: "json" };
import customers from "../data/customers.json" assert { type: "json" };
import checkouts from "../data/checkouts.json" assert { type: "json" };

export default {
  Query: {
    totalPets: (_, { status }) => {
      const filtered = status
        ? pets.filter((p) => p.status === status)
        : pets;
      return filtered.length;
    },

    allPets: (_, { category, status }) => {
      return pets.filter((pet) => {
        return (
          (!category || pet.category === category) &&
          (!status || pet.status === status)
        );
      });
    },

    petById: (_, { id }) => pets.find((p) => p.id === id),

    totalCustomers: () => customers.length,

    allCustomers: () => customers,

    me: (_, __, { currentCustomer }) =>
      currentCustomer || null,
  },

  Pet: {
    status: (pet) => {
      const isCheckedOut = checkouts.some(
        (c) => c.petId === pet.id
      );
      return isCheckedOut ? "CHECKEDOUT" : "AVAILABLE";
    },
    inCareOf: (pet) => {
      const record = checkouts.find(
        (c) => c.petId === pet.id
      );
      return record
        ? customers.find(
            (c) => c.username === record.username
          )
        : null;
    },
    dueDate: (pet) => {
      const record = checkouts.find(
        (c) => c.petId === pet.id
      );
      if (!record) return null;
      const due = new Date(record.checkOutDate);
      due.setDate(due.getDate() + 7);
      return due.toISOString();
    },
  },

  Customer: {
    currentPets: (customer) => {
      const petIds = checkouts
        .filter((c) => c.username === customer.username)
        .map((c) => c.petId);
      return pets.filter((p) => petIds.includes(p.id));
    },
    checkoutHistory: (customer) => {
      return customer.checkoutHistory.map((h) => {
        const pet = pets.find((p) => p.id === h.petId);
        const late =
          new Date(h.checkInDate) >
          new Date(h.checkOutDate + 7 * 86400000);
        return { ...h, pet, late };
      });
    },
  },
};
