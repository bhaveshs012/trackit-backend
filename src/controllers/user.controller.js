import { asyncHandler } from "../utils/AysncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import cookieOptions from "../utils/cookiesOptions.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Ensure the user exists
    if (!user) {
      throw new Error("User not found");
    }

    // Generate access and refresh tokens using user methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the new refresh token in the database once
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Something went wrong while generating tokens");
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Access !!");
    }

    // Decode the data present in the refresh token
    const decodedData = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user by the ID present in the decoded token
    const user = await User.findById(decodedData?._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized Access !! Invalid Refresh Token");
    }

    // Check if the incoming token matches the one stored in the user's record
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid Refresh Token !!");
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // Send the new tokens as cookies and in the response body
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

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

const loginUser = asyncHandler(async (req, res) => {
  //* Get the email and password from the user
  const { email, password } = req.body;

  //* Performing Validations
  if ([email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required !!");
  }

  //* Find the user with that email
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "User does not exists !!"));
  }

  //* Validate the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Invalid Credentials !!"));
  }

  //* generate the tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  //* log the user in : basically set the tokens in the cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //* send the response
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User logged in Successfully !!"
      )
    );
});

export {
  registerUser,
  loginUser,
  generateAccessAndRefreshTokens,
  refreshAccessToken,
};
