import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { JoinRequest } from "../models/joinRequest.model.js";
import { Membership } from "../models/membership.model.js";
import mongoose from "mongoose";

const postProject = asyncHandler(async (req, res) => {

  const {
    title,
    summary,
    description,
    techStack,
    roles,
    deadline,
    stipend,
    availability,
    timing,
    mode,
    location
  } = req.body;

  if (!title || !description || !summary) {
    throw new ApiError(400, "Title, description and summary are required");
  }

  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized: User not authenticated");
  }

  const createdProject = await Project.create({
    title: title.trim(),
    summary,
    description,
    ownerId,   // secure ownership
    techStack,
    roles,
    deadline,
    stipend,
    availability,
    timing,
    mode,
    location,
    teamCount: 1,            // owner is first member
    open: true,
    status: "open"
  });

  await Membership.create({
    projectId: createdProject._id,
    userId: ownerId,
    role: "Owner",
    isOwner: true
  });

  return res
  .status(201)
  .json(new ApiResponse(201, createdProject, "Project created successfully"));
});


const getMarketplaceProjects = asyncHandler(async (req, res) => {

  const {
    mode,
    tech,
    status,
    datePosted,
    page = 1,
    limit = 10,
    sort = "latest"
  } = req.query;

  const pageNumber = Math.max(parseInt(page) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  // ----------- CORE VISIBILITY LOGIC -----------
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  filter.$or = [
    { status: "open" },
    {
      status: "expired",
      updatedAt: { $gte: sevenDaysAgo }
    }
  ];
  // ---------------------------------------------

  if (mode) {
    filter.mode = mode;
  }

  if (tech) {
    const techArray = tech.split(",");
    filter.techStack = { $in: techArray };
  }

  if (status) {
    filter.status = status;
  }

  if (datePosted) {
    const now = new Date();
    let pastDate;

    if (datePosted === "24h") {
      pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - 1);
    }

    if (datePosted === "7days") {
      pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - 7);
    }

    if (datePosted === "30days") {
      pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - 30);
    }

    if (pastDate) {
      filter.createdAt = { $gte: pastDate };
    }
  }

  let sortOption = { createdAt: -1 };

  if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  }

  if (sort === "deadline") {
    sortOption = { deadline: 1 };
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("ownerId", "fullName username avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Project.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projects,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        }
      },
      "Marketplace projects fetched successfully"
    )
  );
});

const getProjectById = asyncHandler(async (req, res) => {

  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project
    .findById(projectId)
    .populate("ownerId", "fullName username avatar")
    .lean();

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project fetched successfully")
    );
});

const applyToProject = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { projectId } = req.params;
  const { appliedRole, message } = req.body;

  // Validate projectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  if (!appliedRole) {
    throw new ApiError(400, "Please choose the role");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check project is open
  if (project.status !== "open") {
    throw new ApiError(400, "Project is not open for applications");
  }

  // Prevent owner from applying
  if (project.ownerId.toString() === userId.toString()) {
    throw new ApiError(400, "Owner cannot apply to own project");
  }

  // Prevent duplicate application
  const existingRequest = await JoinRequest.findOne({
    projectId,
    userId
  });

  if (existingRequest) {
    throw new ApiError(400, "You already applied to this project");
  }

  // Create join request
  const request = await JoinRequest.create({
    projectId,
    userId,
    appliedRole,
    message
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Applied successfully"));
});


const stopRecruiting = asyncHandler(async (req, res) => {

  const { projectId } = req.params;
  const userId = req.user._id;

  // 1️⃣ Validate ID
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 2️⃣ Check if user is owner (via Membership)
  const membership = await Membership.findOne({
    projectId,
    userId,
    isOwner: true
  });

  if (!membership) {
    throw new ApiError(403, "Only owner can stop recruiting");
  }

  // 3️⃣ Update project state
  project.status = "closed";
  project.open = false;

  await project.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Recruitment closed successfully")
  );
});

const pauseRecruiting = asyncHandler(async (req, res) => {

  const { projectId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const membership = await Membership.findOne({
    projectId,
    userId,
    isOwner: true
  });

  if (!membership) {
    throw new ApiError(403, "Only owner can pause recruitment");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.status !== "open") {
    throw new ApiError(400, "Only open projects can be paused");
  }

  project.status = "paused";
  project.open = false;

  await project.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Recruitment paused successfully")
  );
});

const resumeRecruiting = asyncHandler(async (req, res) => {

  const { projectId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const membership = await Membership.findOne({
    projectId,
    userId,
    isOwner: true
  });

  if (!membership) {
    throw new ApiError(403, "Only owner can resume recruitment");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.status !== "paused") {
    throw new ApiError(400, "Only paused projects can be resumed");
  }

  project.status = "open";
  project.open = true;

  await project.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Recruitment resumed successfully")
  );
});


const markProjectCompleted = asyncHandler(async (req, res) => {

  const { projectId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Only owner can complete project
  const membership = await Membership.findOne({
    projectId,
    userId,
    isOwner: true
  });

  if (!membership) {
    throw new ApiError(403, "Only owner can mark project as completed");
  }

  if (project.status === "completed") {
    throw new ApiError(400, "Project is already completed");
  }

  project.status = "completed";
  project.open = false;

  await project.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Project marked as completed successfully")
  );
});


export{
    postProject,
    getMarketplaceProjects,
    getProjectById,
    applyToProject,
    stopRecruiting,
    pauseRecruiting,
    resumeRecruiting,
    markProjectCompleted

}