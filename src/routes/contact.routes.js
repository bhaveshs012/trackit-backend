import { Router } from "express";
import {
  createContact,
  deleteContactById,
  getAllContacts,
  getContactById,
  updateContactById,
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const contactRouter = Router();

//* Defining the routes for managing the user contacts and peer profiles
contactRouter.route("").get(verifyJWT, getAllContacts);
contactRouter.route("/:id").get(verifyJWT, getContactById);
contactRouter.route("").post(verifyJWT, createContact);
contactRouter.route("/:id").patch(verifyJWT, updateContactById);
contactRouter.route("/:id").delete(verifyJWT, deleteContactById);

export default contactRouter;
