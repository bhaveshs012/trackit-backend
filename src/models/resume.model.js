import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

//* File Name: Name-TargetPosition.pdf
const resumeFileSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    targetPosition: {
      type: String,
      required: [true, "Please enter the position you are targetting"],
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    resumeLink: {
      type: String,
      required: [true, "Please upload a resume !!"],
    },
    uploadedOn: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeFileSchema.plugin(mongooseAggregatePaginate);

export const Resume = mongoose.model("Resume", resumeFileSchema);
