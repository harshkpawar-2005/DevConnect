import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { JoinRequest } from "../models/joinRequest.model.js";
import { Membership } from "../models/membership.model.js";


const getMyApplications = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const requests = await JoinRequest.find({ userId })
    .populate({
      path: "projectId",
      select: "title status mode deadline stipend"
    })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      requests,
      "Applications fetched successfully"
    )
  );
});


const getProjectApplications = asyncHandler(async (req, res) => {

  const { projectId } = req.params;
  const userId = req.user._id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  // Check project exists
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (project.ownerId.toString() !== userId.toString()) {
    throw new ApiError(403, "Only owner can view applications");
  }

  // Fetch applications
  const applications = await JoinRequest.find({ projectId })
    .populate({
      path: "userId",
      select: "fullName username avatar skills headline"
    })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      applications,
      "Applications fetched successfully"
    )
  );
});



const acceptApplication = asyncHandler(async (req, res) => {

  const ownerId = req.user._id;
  const { requestId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const request = await JoinRequest.findById(requestId).session(session);

    if (!request) {
      throw new ApiError(404, "Request not found");
    }

    const project = await Project.findById(request.projectId).session(session);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (project.ownerId.toString() !== ownerId.toString()) {
      throw new ApiError(403, "Only owner can accept requests");
    }

    if (request.status !== "pending") {
      throw new ApiError(400, "Request already processed");
    }

    // Update request
    request.status = "accepted";
    await request.save({ session });

    // Create membership
    await Membership.create([{
      projectId: project._id,
      userId: request.userId,
      role: request.appliedRole,
      isOwner: false
    }], { session });

    // Increment team count
    project.teamCount += 1;
    await project.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(
      new ApiResponse(200, {}, "Application accepted successfully")
    );

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    throw error;
  }

});



const rejectApplication = asyncHandler(async (req, res) => {

  const { requestId } = req.params;
  const ownerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request id");
  }

  const request = await JoinRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Application not found");
  }

  const project = await Project.findById(request.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Only owner can reject applications");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Application already processed");
  }

  request.status = "rejected";
  await request.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Application rejected successfully")
  );
});

export{
    getMyApplications,
    getProjectApplications,
    acceptApplication,
    rejectApplication
}