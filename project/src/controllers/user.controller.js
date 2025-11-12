import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const giveUserToken =  await User.findById(userId) 
        const accessToken = giveUserToken.generateAccessToken()
        const refreshToken = giveUserToken.generateRefreshToken()

        giveUserToken.refreshToken = refreshToken // give to db 
        await giveUserToken.save({validateBeforeSave: false}) // save token // if validation is not false than need to again verfy the user
        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500,"somthing went wrong while generate tokens")
    }
}

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

    const {fullname , email , username , password  }=req.body
    // console.log( email );

    // if (fullname === "") {
    //     throw new ApiError(400,"fullname is required")
    // }
    if ([fullname , email , username , password].some((field)=>  field?.trim() === "") ){ // check fileds are empty or not
        throw new ApiError(400, "All fiels required");
    }

    const existedUser = await User.findOne({ // check if user is already in databse or not 
        $or: [ { username } , { email } ]
    })
    if (existedUser) {
        throw new ApiError(409,"user already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path; // check the local path
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is required 1")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, "chai-bakend-youtubeclone-code/avatars") 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "chai-bakend-youtubeclone-code/coverimage") // folder path to upload in cloudinary

    if (!avatar) {
        throw new ApiError(400, "avatar file is required 2") // check avtar is upload or not
    }

    const user = await User.create({ // store user in  db
        fullname,
        avatar: avatar.url, // save only url
        coverImage: coverImage?.url || "", // check cover image is there or not or in empty case store nothing
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refershToken") // remove password and refreshtoken filed in response

    if (!createdUser) {
        throw new ApiError(500,"somthing went wrong while register user")
    }

    return res.status(201).json( // send response to db
        new ApiResponse(200,createdUser ,"user registered ...")
    )

})

const loginUser = asyncHandler(async (req,res) => {
    // get user ditails from db
    //validation 
    // check passwrod and username correct or not
    // password decreypt and again encrypt after compare
    // compare from bd data
    // login

    //req body for data
    // username or email
    // find the user
    // passwrod check
    //access and refresh token
    // send cookie

    const {email , username , password} = req.body
    // if (!username && !email) {
    //     throw new ApiError(400,"username or email is required")
    // }
    

    if (!(username || email)) {
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if (!user) {
        throw new ApiError(404,"user not found")
    }

    const isPasswordValid = await user.isPassword(password) // check password is same or not

    if (!isPasswordValid) {
        throw new ApiError(401,"password incorect")
    }

    const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refershToken")

    const options = { // help to not modify the cookies 
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken ,options).cookie("refreshToken",refreshToken,options)
.json( new ApiResponse(200,{user: loggedInUser , accessToken , refreshToken},"user logged In done"))
})

const loggedOutUserWhenTokenExpire = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate( // update the token
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { // give new value of token
            new: true
        }
    )
    const options = { // not alloed to modify the cookies
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"user logged out"))
})

const refershAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET) // check from db to verify and give new access token
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401,"invalid referes token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"refresh token is expired")
        }
    
        const options = { // not alloed to modify the cookies
            httpOnly: true,
            secure: true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        return res.status(200).cookie("accessToken" , accessToken ,options).cookie("refreshToken",newRefreshToken , options).json(new ApiResponse(200,{accessToken,refreshToken: newRefreshToken},"access token refreshed"))
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})
export {registerUser , loginUser , loggedOutUserWhenTokenExpire ,refershAccessToken} 