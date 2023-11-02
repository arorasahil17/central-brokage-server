import { asyncHandler } from "../middleware/error.js";
import Hero from "../model/hero.js";

const addHero = asyncHandler(async (req, res, next) => {
  const { title, description, imageUrl } = req.body;
  const newHero = new Hero({ title, description, imageUrl });
  const savedHero = await newHero.save();
  res.status(200).json({ status: true, savedHero });
});

const getHero = asyncHandler(async (req, res, next) => {
  const hero = await Hero.findOne({});
  res.status(200).json({ status: true, data: hero });
});

const updateHero = asyncHandler(async (req, res, next) => {
  const { title, description, imageUrl } = req.body;
  const updatedHero = await Hero.updateOne(
    { _id: req.params.id },
    { $set: { title, description, imageUrl } },
    { new: true }
  );
  if (!updatedHero) {
    const error = new Error(
      "Failed to update the section please try again later"
    );
    error.statusCode = 500;
    return next(error);
  }
  res.status(200).json({
    status: true,
    data: {
      message: "Section has been successfully updated",
      date: updatedHero,
    },
  });
});

export { addHero, getHero, updateHero };
