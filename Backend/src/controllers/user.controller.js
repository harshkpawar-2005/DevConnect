import { User } from "../models/user.model";
import {asyncHandler, ApiError, ApiResponse} from "../utils/asyncHandler";

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
        }
        // {
        //     new:true not needed as we are not storing anything
        // }
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

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

}


// Optional chaining prevents errors — not validation