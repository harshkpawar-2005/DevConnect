import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Membership } from "../models/membership.model.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";
const getMyWorkspaces = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  // Fetch all memberships for current user
  const memberships = await Membership.find({ userId })
    .populate({
      path: "projectId",
      select: "title status deadline mode teamCount"
    })
    .sort({ createdAt: -1 })
    .lean();

  const ownerProjects = [];
  const memberProjects = [];

  memberships.forEach((membership) => {

    // Skip if project was deleted (safety check)
    if (!membership.projectId) return;

    const workspaceData = {
      projectId: membership.projectId._id,
      title: membership.projectId.title,
      role: membership.role,
      status: membership.projectId.status,
      deadline: membership.projectId.deadline,
      mode: membership.projectId.mode,
      teamCount: membership.projectId.teamCount
    };

    if (membership.isOwner) {
      ownerProjects.push(workspaceData);
    } else {
      memberProjects.push(workspaceData);
    }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ownerProjects,
        memberProjects
      },
      "My workspaces fetched successfully"
    )
  );
});


const getWorkspace = asyncHandler(async (req, res) => {

  const { projectId } = req.params;
  const userId = req.user._id;

  // 1️⃣ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  // 2️⃣ Check project exists
  const project = await Project.findById(projectId)
    .select("title description status deadline mode techStack")
    .lean();

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 3️⃣ Authorization via Membership
  const membership = await Membership.findOne({
    projectId,
    userId
  });

  if (!membership) {
    throw new ApiError(403, "Access denied. Not a workspace member.");
  }

  // 4️⃣ Fetch all members
  const members = await Membership.find({ projectId })
    .populate({
      path: "userId",
      select: "fullName username avatar headline"
    })
    .lean();

  // 5️⃣ Format members cleanly
  const formattedMembers = members.map((member) => ({
    userId: member.userId._id,
    fullName: member.userId.fullName,
    username: member.userId.username,
    avatar: member.userId.avatar,
    headline: member.userId.headline,
    role: member.role,
    responsibilityText: member.responsibilityText,
    isOwner: member.isOwner,
    joinedAt: member.joinedAt
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        project,
        currentUserRole: membership.role,
        isOwner: membership.isOwner,
        members: formattedMembers
      },
      "Workspace fetched successfully"
    )
  );
});


export {
    getMyWorkspaces,
    getWorkspace
}
