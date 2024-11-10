import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const applicationSchema = new Schema(
  {
    companyName: {
      type: String,
      trim: true,
      required: [true, "Company Name is required !!"],
    },

    position: {
      type: String,
      trim: true,
      required: [true, "Company Name is required !!"],
    },
    jobLink: {
      type: String,
      trim: true,
    },
    applicationStatus: {
      type: String,
      enum: [
        "Applied",
        "Interviewing",
        "Offer Received",
        "Accepted",
        "Rejected",
        "Withdrawn",
      ],
      default: "Applied",
    },
    //* Hyperlinks to the resume and cover letter added
    resumeUploaded: {
      type: String,
      required: [true, "Resume is required !!"],
    },
    coverLetterUploaded: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    appliedOn: {
      type: Date,
      required: [true, "Applied Date is required !!"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

applicationSchema.plugin(mongooseAggregatePaginate);

export const Application = mongoose.model("Application", applicationSchema);
