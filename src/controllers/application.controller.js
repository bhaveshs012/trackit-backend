import { asyncHandler } from "../utils/AysncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/application.model.js";
import mongoose from "mongoose";

const createApplication = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const {
    companyName,
    position,
    jobLink,
    resumeUploaded,
    applicationStatus,
    coverLetterUploaded,
    notes,
    appliedOn,
  } = req.body;

  //* Check for empty values
  if (
    [companyName, position, resumeUploaded].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  //* Check if the date is valid
  const parsedDate = new Date(appliedOn);
  if (isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Invalid applied on date provided !!");
  }
  if (parsedDate > new Date()) {
    throw new ApiError(
      400,
      "Invalid applied on date provided. Cannot provide a future date !!"
    );
  }

  //* Create the job application
  const jobApplication = await Application.create({
    companyName,
    position,
    jobLink: jobLink ?? "",
    applicationStatus: applicationStatus === "" ? "Applied" : applicationStatus,
    resumeUploaded,
    coverLetterUploaded: coverLetterUploaded ?? "",
    notes: notes ?? "",
    appliedOn,
    userId,
  });

  if (!jobApplication) {
    return res
      .status(501)
      .json(
        new ApiResponse(
          501,
          "",
          "Server Error :: Job application could not be added !!"
        )
      );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        jobApplication,
        "Job application has been added successfully !!"
      )
    );
});

const getApplicationsByStatus = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { page = 1, limit = 10, status } = req.query;

  //* Validate the job Status
  const allowedJobStatuses = [
    "Applied",
    "Interviewing",
    "Offer Received",
    "Accepted",
    "Rejected",
    "Withdrawn",
  ];
  const validStatus = allowedJobStatuses.includes(status);

  if (!validStatus) {
    throw new ApiError(401, "Invalid Status Provided !!");
  }

  //* Build the aggregation pipeline
  const aggregationPipeline = Application.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        applicationStatus: status,
      },
    },
    {
      $project: {
        companyName: 1,
        position: 1,
        jobLink: 1,
        applicationStatus: 1,
        resumeUploaded: 1,
        coverLetterUploaded: 1,
        notes: 1,
        userId: 1,
        appliedOn: 1,
      },
    },
  ]);

  //* Create pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const results = await Application.aggregatePaginate(
    aggregationPipeline,
    options
  );

  if (!results) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          [],
          `Job Applications - (${status}) could not be fetched !!`
        )
      );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        applications: results.docs,
        status: status,
        pagination: {
          totalDocs: results.totalDocs,
          totalPages: results.totalPages,
          currentPage: results.page,
          limit: results.limit,
        },
      },
      `Job Applications - (${status}) fetched successfully !!`
    )
  );
});

const getArchivedApplications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { page = 1, limit = 10 } = req.query;

  //* Build the aggregation pipeline
  const aggregationPipeline = Application.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        applicationStatus: {
          $in: ["Rejected", "Accepted", "Withdrawn"],
        },
      },
    },
    {
      $project: {
        companyName: 1,
        position: 1,
        jobLink: 1,
        applicationStatus: 1,
        resumeUploaded: 1,
        coverLetterUploaded: 1,
        notes: 1,
        userId: 1,
        appliedOn: 1,
      },
    },
  ]);

  //* Create pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const results = await Application.aggregatePaginate(
    aggregationPipeline,
    options
  );

  if (!results) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          [],
          `Job Applications - (Archived) could not be fetched !!`
        )
      );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        applications: results.docs,
        status: "archived",
        pagination: {
          totalDocs: results.totalDocs,
          totalPages: results.totalPages,
          currentPage: results.page,
          limit: results.limit,
        },
      },
      `Job Applications - (Archived) fetched successfully !!`
    )
  );
});

const getApplicationById = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  const userId = req.user?._id;

  //* Check if the contact exists
  const application = await Application.findById(applicationId);
  if (!application) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The application details you are trying to find does not exist !!"
        )
      );
  }

  if (application.userId.toString() !== userId.toString()) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view this application details !!"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        application,
        "Job Application Details have been fetched successfully !!"
      )
    );
});

const updateApplicationById = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  const updates = req.body;
  const userId = req.user?._id;

  //* Check if the application exists
  const application = await Application.findById(applicationId);
  if (!application) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The application details you are trying to update does not exist !!"
        )
      );
  }

  if (application.userId.toString() !== userId.toString()) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view or update this job application !!"
        )
      );
  }

  //* Check if the updates object is valid
  const allowedUpdates = [
    "companyName",
    "position",
    "jobLink",
    "applicationStatus",
    "resumeUploaded",
    "coverLetterUploaded",
    "notes",
    "appliedOn",
  ];
  const isValidOperation = Object.keys(updates).every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).json(new ApiError(400, "Invalid Updates !!"));
  }

  //* Find by id and update
  const updatedApplication = await Application.findByIdAndUpdate(
    applicationId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedApplication) {
    return res
      .status(501)
      .json(new ApiError(501, "Application Details could not be updated !!"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedApplication,
        "Job Application Details have been updated successfully !!"
      )
    );
});

const deleteApplicationById = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  const userId = req.user?._id;

  //* Check if the contact exists
  const application = await Application.findById(applicationId);
  if (!application) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "The application details you are trying to delete does not exist !!"
        )
      );
  }

  if (application.userId.toString() !== userId.toString()) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "You are not authorized to view or delete this job application !!"
        )
      );
  }

  //* Find by id and delete
  const deletedApplication = await Application.findByIdAndDelete(applicationId);

  if (!deletedApplication) {
    return res
      .status(501)
      .json(new ApiError(501, "Application Details could not be deleted !!"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedApplication,
        "Job Application Details have been deleted successfully !!"
      )
    );
});

export {
  createApplication,
  getApplicationsByStatus,
  getArchivedApplications,
  getApplicationById,
  updateApplicationById,
  deleteApplicationById,
};
