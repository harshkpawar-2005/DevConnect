import { User } from "../models/user.model";
import {asyncHandler, ApiError, ApiResponse} from "../utils/asyncHandler";


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

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
    .status(201)
    .json( new ApiResponse(200, createdUser, "User registered Successfully") )

})


export { registerUser }

// Optional chaining prevents errors — not validation