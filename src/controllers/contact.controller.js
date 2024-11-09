import { asyncHandler } from "../utils/AysncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contact } from "../models/contact.model.js";

const getAllContacts = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  //* Get all the contacts which have the same user id
  const allContacts = await Contact.find({
    userId: userId,
  });

  if (!allContacts) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "",
          "Contacts could not be fetched due to some internal server error !!"
        )
      );
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId: userId,
        allContacts: allContacts,
      },
      "Contact Details fetched successfully"
    )
  );
});

const createContact = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    companyName,
    role,
    phoneNumber,
    linkedInProfile,
  } = req.body;

  const userId = req.user?._id;

  //* Perform validations
  if (
    [firstName, lastName, email, companyName, role, phoneNumber].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  //* Create the contact
  const contact = await Contact.create({
    firstName,
    lastName,
    email,
    companyName,
    role,
    phoneNumber,
    linkedInProfile,
    userId,
  });

  if (!contact) {
    return res
      .status(501)
      .json(new ApiResponse(501, "", "Contact Details could not be added !!"));
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        contactDetails: contact,
      },
      "Contact Details added successfully"
    )
  );
});

const updateContact = asyncHandler(async (req, res) => {
  const contactId = req.params.id;
  const updates = req.body;
  const userId = req.user?._id;

  //* Check if the contact exists
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The contact details you are trying to update does not exist !!"
        )
      );
  }

  if (contact.userId.toString() !== userId.toString()) {
    console.log(contact.userId, userId);

    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view or update this contact !!"
        )
      );
  }

  // Validate fields - check if any extra field is present
  const allowedUpdates = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "linkedInProfile",
  ];
  const isValidOperation = Object.keys(updates).every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).json(new ApiError(400, "Invalid Updates !!"));
  }

  //* Find by id and update
  const updatedContact = await Contact.findByIdAndUpdate(
    contactId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedContact) {
    return res
      .status(500)
      .json(new ApiError(500, "Contact Details could not be updated !!"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedContact,
        "Contact Details have been updated successfully !!"
      )
    );
});

const deleteContact = asyncHandler(async (req, res) => {
  const contactId = req.params.id;
  const userId = req.user?._id;

  //* Check if the contact exists
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The contact details you are trying to delete does not exist !!"
        )
      );
  }

  if (contact.userId.toString() !== userId.toString()) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view or delete this contact !!"
        )
      );
  }

  //* Find by id and delete
  const deletedContact = await Contact.findByIdAndDelete(contactId);

  if (!deletedContact) {
    return res
      .status(500)
      .json(new ApiError(500, "Contact Details could not be deleted !!"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedContact,
        "Contact Details have been deleted successfully !!"
      )
    );
});

export { createContact, getAllContacts, updateContact, deleteContact };
