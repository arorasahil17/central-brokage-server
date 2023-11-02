import { asyncHandler } from "../middleware/error.js";
import Contact from "../model/contact.js";

const addContact = asyncHandler(async (req, res, next) => {
  const contact = new Contact({ ...req.body });
  await contact.save();
  res
    .status(201)
    .json({ message: "Contact added successfully", data: contact });
});

const updateContact = asyncHandler(async (req, res, next) => {
  let contact = await Contact.findByIdAndUpdate(req.params.id, req.body);
  if (!contact) {
    return res.status(404).send("Something Went Wrong");
  }
  res.status(200).json({ status: true });
});

const getContact = asyncHandler(async (req, res, next) => {
  let contact = await Contact.findOne({});
  res.status(200).json({ status: true, contact });
});

export { addContact, getContact, updateContact };
