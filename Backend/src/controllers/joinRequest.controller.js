import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { JoinRequest } from "../models/joinRequest.model.js";


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


export{
    getMyApplications,
    getProjectApplications
}