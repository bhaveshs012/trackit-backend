import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const interviewRoundEnum = {
  PHONE_SCREENING: "Phone Screening",
  TECHNICAL_INTERVIEW: "Technical Interview",
  HR_INTERVIEW: "HR Interview",
  ON_SITE: "On-site",
  FINAL_ROUND: "Final Round",
  OFFER_DISCUSSION: "Offer Discussion",
  OTHER: "Other",
};

const interviewRoundSchema = new Schema(
  {
    position: {
      type: String,
      required: [true, "Position / Role is required !!"],
    },
    companyName: {
      type: String,
      required: [true, "Company Name is required !!"],
    },
    interviewRound: {
      type: String,
      enum: Object.values(interviewRoundEnum), // Use the enum values
      required: true,
    },
    roundDetails: {
      type: String,
    },
    scheduledOn: {
      type: Date,
      required: [true, "Scheduled Date is required !!"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

interviewRoundSchema.plugin(mongooseAggregatePaginate);

const InterviewRound = mongoose.model("InterviewRound", interviewRoundSchema);

export { InterviewRound, interviewRoundEnum };
