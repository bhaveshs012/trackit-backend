import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createApplication,
  getApplicationById,
  updateApplicationById,
  deleteApplicationById,
  getApplicationsByStatus,
  getArchivedApplications,
  getArchivedApplicationsCount,
} from "../controllers/application.controller.js";

const applicationRouter = Router();

//* Defining all the routes for handling the job applications for user
applicationRouter.route("").get(verifyJWT, getApplicationsByStatus);
applicationRouter.route("/archived").get(verifyJWT, getArchivedApplications);
applicationRouter
  .route("/archived/count")
  .get(verifyJWT, getArchivedApplicationsCount);
applicationRouter.route("").post(verifyJWT, createApplication);
applicationRouter.route("/:id").get(verifyJWT, getApplicationById);
applicationRouter.route("/:id").patch(verifyJWT, updateApplicationById);
applicationRouter.route("/:id").delete(verifyJWT, deleteApplicationById);

export default applicationRouter;
