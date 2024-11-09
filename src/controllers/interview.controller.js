import { asyncHandler } from "../utils/AysncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { InterviewRound } from "../models/interview.model.js";
import mongoose from "mongoose";

const getAllInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user?._id;

  //* Build the aggregation pipeline
  const aggregationPipeline = InterviewRound.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        scheduledOn: { $gte: new Date() },
      },
    },
    {
      $project: {
        position: 1,
        userId: 1,
        companyName: 1,
        scheduledOn: 1,
        interviewRound: 1,
        roundDetails: 1,
      },
    },
  ]);

  //* Create pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const results = await InterviewRound.aggregatePaginate(
    aggregationPipeline,
    options
  );

  if (!results) {
    return res
      .status(500)
      .json(
        new ApiResponse(500, [], "Interview Rounds Could not be fetched !!")
      );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        interviewRounds: results.docs,
        pagination: {
          totalDocs: results.totalDocs,
          totalPages: results.totalPages,
          currentPage: results.page,
          limit: results.limit,
        },
      },
      "Interview Rounds Fetched Successfully !!"
    )
  );
});

const getInterviewRoundById = asyncHandler(async (req, res) => {
  const interviewRoundId = req.params.id;
  const userId = req.user?._id;

  //* Check if the contact exists
  const interviewRound = await InterviewRound.findById(interviewRoundId);
  if (!interviewRound) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The interview round details you are trying to find does not exist !!"
        )
      );
  }

  if (interviewRound.userId.toString() !== userId.toString()) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view this interview round details !!"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        interviewRound,
        "Interview Round Details have been fetched successfully !!"
      )
    );
});

const createInterviewRound = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { position, companyName, interviewRound, roundDetails, scheduledOn } =
    req.body;

  //* Perform validations
  if (
    [position, interviewRound, companyName, scheduledOn].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  const parsedDate = new Date(scheduledOn);
  if (isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Invalid scheduled on date provided !!");
  }

  //* Add the Interview Details to the DB
  const createdInterviewRound = await InterviewRound.create({
    companyName,
    position,
    interviewRound,
    roundDetails: roundDetails ?? "",
    scheduledOn,
    userId,
  });

  if (!createdInterviewRound) {
    return res
      .status(501)
      .json(
        new ApiResponse(
          501,
          "",
          "Interview Round Details could not be added !!"
        )
      );
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        interviewRoundDetails: createdInterviewRound,
      },
      "Interview Round Details added successfully"
    )
  );
});

const updateInterviewRoundById = asyncHandler(async (req, res) => {
  const interviewRoundId = req.params.id;
  const updates = req.body;
  const userId = req.user?._id;

  //* Check if the contact exists
  const interviewRound = await InterviewRound.findById(interviewRoundId);
  if (!interviewRound) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The interview round details you are trying to update does not exist !!"
        )
      );
  }

  if (interviewRound.userId.toString() !== userId.toString()) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view or update this interview round details !!"
        )
      );
  }

  // Validate fields - check if any extra field is present
  const allowedUpdates = [
    "position",
    "companyName",
    "interviewRound",
    "roundDetails",
    "scheduledOn",
  ];
  const isValidOperation = Object.keys(updates).every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).json(new ApiError(400, "Invalid Updates !!"));
  }

  //* Find by id and update
  const updatedInterviewRound = await InterviewRound.findByIdAndUpdate(
    interviewRoundId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedInterviewRound) {
    return res
      .status(501)
      .json(
        new ApiError(501, "Interview Round Details could not be updated !!")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedInterviewRound,
        "Interview Round Details have been updated successfully !!"
      )
    );
});

const deleteInterviewRoundById = asyncHandler(async (req, res) => {
  const interviewRoundId = req.params.id;
  const userId = req.user?._id;

  //* Check if the contact exists
  const interviewRound = await InterviewRound.findById(interviewRoundId);
  if (!interviewRound) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The interview round details you are trying to delete does not exist !!"
        )
      );
  }

  if (interviewRound.userId.toString() !== userId.toString()) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view or delete this interview round details !!"
        )
      );
  }

  //* Find by id and delete
  const deletedInterviewRound =
    await InterviewRound.findByIdAndDelete(interviewRoundId);

  if (!deletedInterviewRound) {
    return res
      .status(500)
      .json(
        new ApiError(500, "Interview Round Details could not be deleted !!")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedInterviewRound,
        "Interview Round Details have been deleted successfully !!"
      )
    );
});

export {
  getAllInterviews,
  getInterviewRoundById,
  createInterviewRound,
  deleteInterviewRoundById,
  updateInterviewRoundById,
};
