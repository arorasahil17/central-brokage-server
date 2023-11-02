import { asyncHandler } from "../middleware/error.js";
import Service from "../model/service.js";

const addService = asyncHandler(async (req, res, next) => {
  const service = new Service({ ...req.body });
  await service.save();
  res.status(201).json(service);
});

const updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!service) {
    const error = new Error(
      "Failed to update, please try again after sometimes"
    );
    return next(error);
  }
  res.status(200).json({ status: true, service });
});

const getService = asyncHandler(async (req, res, next) => {
  const services = await Service.findOne({});
  res.status(200).json({ status: true, services });
});

export { addService, updateService, getService };
