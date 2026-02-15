import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

async function generateAccessAndRefreshTokens(user){
    try {
        const accessToken= user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken=refreshToken
    
        await user.save({ validateBeforeSave: false })
    
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh and access token")
    }
}

const registerUser= asyncHandler(async (req,res)=>{
    const {fullName, username, email, password}=req.body

    if (
        [fullName, email, username, password].some((field) => !field || field.trim() === "")//plz 
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    const existingUser= await User.findOne({ //findone return the 1st matched document or null if nothing found
        $or:[{ username },{ email }]
    })

    if(existingUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const user= await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password
    })

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user) //is u are at this line menas user is alredy created..bcz crete throw error doesnt return the null or undefined never

    const registeredUser  = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!registeredUser ) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    const options= {
        httpOnly:true,
        secure:true
    }

    return res
    .status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json( new ApiResponse(200, registeredUser , "User registered Successfully") )

})


const loginUser= asyncHandler( async (req,res)=>{

    const {email, password}=req.body

    if(!email || !password){
        throw new ApiError(400, "email and  password is required")
    }

    const user= await User.findOne({email}).select("+password")

    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400, "password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    const options= {
        httpOnly:true,
        secure:true
    }

    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200, loggedInUser, "User logged in Successfully"))


})

const logoutUser= asyncHandler( async (req,res)=>{
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1 // this removes the field from document
            }
        },
        {
            new:true //not needed as we are not storing anything
        }
    )

    
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200 , {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changePassword= asyncHandler( async (req,res)=>{

    const {oldPassword, newPassword}=req.body

    if(!oldPassword || !newPassword){
        throw new ApiError(400,"old password and new password are required")
    }

    const user= await User.findById(req.user?._id).select("+password")

    if(!user){
        throw new ApiError(401, "user doesn't exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid Old Passwrod")
    }

    user.password= newPassword
    user.refreshToken= undefined//test it harsh what exactly happens

    await user.save( /*{ validateBeforeSave: false }*/ )
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const getMyProfile = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id)
    .select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Private profile fetched successfully")
  );
});

const getPublicProfile = asyncHandler(async (req, res) => {

  const { username } = req.params;

  const user = await User.findOne({ username })
    .select(
      "fullName username headline bio avatar coverImage resumeUrl location skills " +
      "workExperience education github linkedin links " +
      "createdProjectCount participatedProjectCount"
    );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "Public profile fetched successfully")
  );
});

const updateMyProfile = asyncHandler(async (req, res) => {

  const allowedFields = [
    "fullName",
    "headline",
    "bio",
    "location",
    "dob",
    "skills",
    "workExperience",
    "education",
    "github",
    "linkedin",
    "links",
    "experienceLevel"
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    {
      new: true,
      runValidators: true
    }
  ).select("-password -refreshToken");

  if(!updatedUser){
    throw new ApiError(404, "user not found");
  }
  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Profile updated successfully")
  );
});

const updateAvatar= asyncHandler( async (req,res)=>{
    const avatarLocalPath= req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "No file uploaded")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)

    if(!avatar?.url){
        throw new ApiError(500, "Failed to upload avatar")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar: avatar.url
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )

})

const updateCoverImage= asyncHandler( async (req,res)=>{
    const coverImageLocalPath= req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "No file uploaded")
    }

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage?.url){
        throw new ApiError(500, "Failed to upload cover image")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )

})

const updateResume= asyncHandler( async (req,res)=>{
    const resumeLocalPath= req.file?.path

    if(!resumeLocalPath){
        throw new ApiError(400, "No file uploaded")
    }

    const resume= await uploadOnCloudinary(resumeLocalPath)

    if(!resume?.url){
        throw new ApiError(500, "Failed to upload resume")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            resumeUrl: resume.url
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Resume updated successfully")
    )

})



const getUserCreatedProjects = asyncHandler(async (req, res) => {

  const { username } = req.params;

  const user = await User.findOne({ username }).select("_id");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const projects = await Project.find({ ownerId: user._id })
    .select("title status deadline mode teamCount")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, projects, "Created projects fetched successfully")
  );
});


const getUserParticipatedProjects = asyncHandler(async (req, res) => {

  const { username } = req.params;

  const user = await User.findOne({ username }).select("_id");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const memberships = await Membership.find({
    userId: user._id,
    isOwner: false
  })
    .populate({
      path: "projectId",
      select: "title status deadline mode teamCount"
    })
    .sort({ createdAt: -1 })
    .lean();

  const projects = memberships
    .filter(m => m.projectId)
    .map(m => m.projectId);

  return res.status(200).json(
    new ApiResponse(200, projects, "Participated projects fetched successfully")
  );
});

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getMyProfile,
    getPublicProfile,
    updateMyProfile,
    changePassword,
    updateAvatar,
    updateCoverImage,
    updateResume,
    getUserCreatedProjects,
    getUserParticipatedProjects
}


// Optional chaining prevents errors — not validation