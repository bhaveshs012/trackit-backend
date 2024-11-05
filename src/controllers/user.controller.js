import { asyncHandler } from "../utils/AysncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  //* Getting the details from the user
  const {
    firstName,
    lastName,
    email,
    password,
    skills,
    aspiringRole,
    experienceLevel,
  } = req.body;

  // Performing the validations
  if (
    [firstName, lastName, email, password, aspiringRole, experienceLevel].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  //* Check if the user already exists
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    return res
      .status(401)
      .json(new ApiResponse(401, "", "User already exists !!"));
  }

  //* Create the user
  const user = await User.create({
    firstName: firstName,
    lastName: lastName,
    email,
    password,
    skills,
    aspiringRole,
    experienceLevel,
  });

  //* Check the created user
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res
      .status(500)
      .json(new ApiResponse(500, "", "User could not be registered !!"));
  }

  // Respond with the newly created user
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: createdUser,
      },
      "User registered successfully"
    )
  );
});

export { registerUser };
