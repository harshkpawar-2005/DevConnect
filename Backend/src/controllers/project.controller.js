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

  if (!title || !description || summary) {
    throw new ApiError(400, "Title, description and summary are required");
  }

  const createdProject = await Project.create({
    title: title.trim(),
    summary,
    description,
    ownerId: req.user._id,   // secure ownership
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


export{
    createProject,

}