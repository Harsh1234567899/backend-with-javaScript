import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

    // get user details from frontend
    // validation - not empty
    // check if user already exists : username , email
    // check for images , check for avtar
    // upload to cloudinary , avtar
    // create user object - create entry in db
    // remove password and refersh token from response
    // check for user creation
    // response return

    const {fullname , email , username , password}=req.body
    console.log( email );

    // if (fullname === "") {
    //     throw new ApiError(400,"fullname is required")
    // }
    if ([fullname , email , username , password].some((field)=>  field?.trim() === "") ){ // check fileds are empty or not
        throw new ApiError(400, "All fiels required");
    }

    const existedUser = User.findOne({ // check if user is already in databse or not 
        $or: [ { username } , { email } ]
    })
    if (existedUser) {
        throw new ApiError(409,"user already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path; // check the local path
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath) // give a local path to cloudinary to upload
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is required") // check avtar is upload or not
    }

    const user = await User.create({ // store user in  db
        fullname,
        avatar: avatar.url, // save only url
        coverImage: coverImage?.url || "", // check cover image is there or not or in empty case store nothing
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refershToken")

    if (!createdUser) {
        throw new ApiError(500,"somthing went wrong while register user")
    }

    return res.status(201).json( // send response to db
        ApiResponse(200,createdUser ,"user registered ...")
    )

})

export {registerUser} 