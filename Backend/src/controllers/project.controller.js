import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProject = asyncHandler(async (req, res) => {

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
    recruiting: true,
    status: "recruiting"
  });

  return res
  .status(201)
  .json(new ApiResponse(201, createdProject, "Project created successfully"));
});


const getMarketplaceProjects = asyncHandler(async (req, res) => {

  // =========================
  // Extract Query Parameters
  // =========================
  const {
    mode,
    tech,
    status,
    datePosted,
    page = 1,
    limit = 10,
    sort = "latest"
  } = req.query;

  // =========================
  // Pagination Calculations
  // =========================
  const pageNumber = Math.max(parseInt(page) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
  const skip = (pageNumber - 1) * limitNumber;

  // =========================
  // Build Dynamic Filter
  // =========================
  const filter = {};

  // Filter by mode
  if (mode) {
    filter.mode = mode;
  }

  // Filter by tech stack (multiple allowed)
  if (tech) {
    const techArray = tech.split(",");
    filter.techStack = { $in: techArray };
  }

  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Filter by date posted
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

  // =========================
  // Sorting
  // =========================
  let sortOption = { createdAt: -1 };

  if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  }

  if (sort === "deadline") {
    sortOption = { deadline: 1 };
  }

  // =========================
  // Execute Query
  // =========================
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("ownerId", "fullName username avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Project.countDocuments(filter)
  ]);

  // =========================
  // Send Response
  // =========================
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


export{
    createProject,
    getMarketplaceProjects,


}