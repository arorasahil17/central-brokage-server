import Loads from "../model/loads.js";
import { asyncHandler } from "../middleware/error.js";
const addLoad = asyncHandler(async (req, res, next) => {
  const {
    pickUpLocation,
    dropOffLocation,
    pickUpDate,
    totalMiles,
    pickUpTime,
    dropOffTime,
    weight,
    price,
    equipment,
    eqLength,
    loadType,
    mapLink,
    equipmentRequirement,
    dropOffDate,
  } = req.body;

  if (
    !pickUpLocation ||
    !dropOffLocation ||
    !pickUpDate ||
    !dropOffDate ||
    !totalMiles ||
    !weight ||
    !price ||
    !pickUpTime ||
    !dropOffTime ||
    !equipment ||
    !eqLength ||
    !equipmentRequirement ||
    !loadType
  ) {
    const error = new Error("All details are required");
    error.statusCode = 400;
    next(error);
  }
  const ratePerMile = (price / totalMiles).toFixed(2);
  let load = new Loads({
    pickUpDate,
    pickUpLocation,
    dropOffLocation,
    dropOffDate,
    pickUpTime,
    dropOffTime,
    totalMiles,
    weight,
    price,
    ratePerMile: parseFloat(ratePerMile),
    equipment,
    eqLength,
    loadType,
    mapLink,
    equipmentRequirement,
  });
  const savedLoad = await load.save();
  res.status(201).json({
    status: true,
    message: "load added successfully",
    data: savedLoad,
  });
});

const getLoads = asyncHandler(async (req, res, next) => {
  let loads = await Loads.find(
    {},
    {
      __v: 0,
    }
  );

  if (!loads) {
    const error = new Error("Something Went Wrong");
    next(error);
  }
  res
    .status(200)
    .json({ status: true, data: loads, message: "Loads Data Fetched" });
});

const deleteLoad = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const deletedLoad = await Loads.findByIdAndDelete(id);
  res.status(200).json({ status: true, message: "Load Deleted" });
});

const updateLoad = asyncHandler(async (req, res, next) => {
  const updatedLoad = await Loads.updateOne(
    { _id: req.body._id },
    { $set: { ...req.body } }
  );
  if (!updatedLoad) {
    const error = new Error("Failed to Update");
    return next(error);
  }
  res
    .status(200)
    .json({ status: true, message: "Updated Successfully", data: updatedLoad });
});

export { addLoad, getLoads, deleteLoad, updateLoad };
