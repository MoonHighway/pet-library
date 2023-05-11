import express from "express";
import mongodb from "mongodb";

const restRoutes = function (pets) {
  let router = express.Router();
  router.get("/pets", async (req, res) => {
    res.json(await pets.find().toArray());
  });

  router.get("/pet/:id", async (req, res) => {
    console.log(req.params.id);
    res.json(
      await pets.findOne({
        _id: mongodb.ObjectID(req.params.id),
      })
    );
  });

  router.get("/pets/:category", async (req, res) => {
    res.json(
      await pets
        .find({ category: req.params.category })
        .toArray()
    );
  });

  router.get("/randomPet", async (req, res) => {
    const allPets = await pets.find().toArray();
    const randomIndex = Math.floor(
      Math.random() * allPets.length
    );
    res.json(allPets[randomIndex]);
  });

  return router;
};

export default restRoutes;
