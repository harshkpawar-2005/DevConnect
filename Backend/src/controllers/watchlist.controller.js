const addToWatchlist = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  // Prevent owner from saving own project (optional but clean)
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.ownerId.toString() === userId.toString()) {
    throw new ApiError(400, "Cannot save your own project");
  }

  await Watchlist.create({
    userId,
    projectId
  });

  return res.status(201).json(
    new ApiResponse(201, {}, "Project added to watchlist")
  );

});

const removeFromWatchlist = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const deleted = await Watchlist.findOneAndDelete({
    userId,
    projectId
  });

  if (!deleted) {
    throw new ApiError(404, "Project not in watchlist");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Project removed from watchlist")
  );

});


const getMyWatchlist = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const savedProjects = await Watchlist.find({ userId })
    .populate({
      path: "projectId",
      populate: {
        path: "ownerId",
        select: "fullName username avatar"
      }
    })
    .sort({ createdAt: -1 })
    .lean();

  const projects = savedProjects.map(item => item.projectId);

  return res.status(200).json(
    new ApiResponse(200, projects, "Watchlist fetched successfully")
  );

});


const checkIfSaved = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { projectId } = req.params;

  const exists = await Watchlist.exists({
    userId,
    projectId
  });

  return res.status(200).json(
    new ApiResponse(200, { saved: !!exists }, "Watchlist check")
  );

});

export {
    addToWatchlist,
    removeFromWatchlist,
    getMyWatchlist,
    checkIfSaved
}