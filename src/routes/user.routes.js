import { Router } from "express";
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  logoutUser,
  updateUser,
  addResume,
  getAllResumes,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  upload,
  multerErrorHandler,
} from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);

userRouter.route("/refresh-token").post(verifyJWT, refreshAccessToken);
userRouter.route("/current-user").get(verifyJWT, getCurrentUser);
userRouter.route("/update-profile").patch(verifyJWT, updateUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);

//* File Handling
userRouter.route("/resume").post(
  verifyJWT,
  upload.fields([
    {
      name: "resume",
      maxCount: 1,
    },
  ]),
  multerErrorHandler,
  addResume
);
userRouter.route("/resume").get(verifyJWT, getAllResumes);

export default userRouter;
