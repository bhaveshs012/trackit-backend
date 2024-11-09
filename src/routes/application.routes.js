import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createApplication,
  getApplicationById,
  updateApplicationById,
  deleteApplicationById,
} from "../controllers/application.controller.js";

const applicationRouter = Router();

//* Defining all the routes for handling the job applications for user
// applicationRouter.route("").get(verifyJWT, getAllApplications);
applicationRouter.route("").post(verifyJWT, createApplication);
applicationRouter.route("/:id").get(verifyJWT, getApplicationById);
applicationRouter.route("/:id").patch(verifyJWT, updateApplicationById);
applicationRouter.route("/:id").delete(verifyJWT, deleteApplicationById);

export default applicationRouter;
