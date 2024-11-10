import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createInterviewRound,
  deleteInterviewRoundById,
  getAllInterviews,
  getInterviewRoundById,
  updateInterviewRoundById,
  getArchivedInterviews,
} from "../controllers/interview.controller.js";

const interviewRouter = Router();

//* Defining the routes for managing the user interviews that are scheduled !!
interviewRouter.route("").get(verifyJWT, getAllInterviews);
interviewRouter.route("/archived").get(verifyJWT, getArchivedInterviews);
interviewRouter.route("/:id").get(verifyJWT, getInterviewRoundById);
interviewRouter.route("").post(verifyJWT, createInterviewRound);
interviewRouter.route("/:id").patch(verifyJWT, updateInterviewRoundById);
interviewRouter.route("/:id").delete(verifyJWT, deleteInterviewRoundById);

export default interviewRouter;
