import { Router } from "express";
import {
  createContact,
  deleteContact,
  getAllContacts,
  updateContact,
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const contactRouter = Router();

//* Defining the routes for managing the user contacts and peer profiles
contactRouter.route("").get(verifyJWT, getAllContacts);
contactRouter.route("").post(verifyJWT, createContact);
contactRouter.route("/:id").patch(verifyJWT, updateContact);
contactRouter.route("/:id").delete(verifyJWT, deleteContact);

export default contactRouter;
