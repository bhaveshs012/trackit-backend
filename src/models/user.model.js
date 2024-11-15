import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    //* Basic Information
    firstName: {
      type: String,
      required: [true, "First Name is requried"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is requried"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    //* Always stored in DB to validate and re generate tokens
    refreshToken: {
      type: String,
      default: null, // Initialize refresh token field in the schema
    },

    //* Job Specific Details
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    aspiringRole: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Intermediate", "Senior", "Principal"],
      default: "Entry",
    },
  },
  {
    timestamps: true,
  }
);

//* Methods to hash passwords
userSchema.pre("save", async function (next) {
  // Check if password is modified or not
  if (!this.isModified("password")) return next();

  // Hash the password with a salt round of 10
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//* Creating user methods:
// For checking if the provided password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// For generating the accessToken
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Ensure this is set in your environment
    }
  );
};

// For generating the refreshToken
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Ensure this is set in your environment
    }
  );
};

export const User = mongoose.model("User", userSchema);
