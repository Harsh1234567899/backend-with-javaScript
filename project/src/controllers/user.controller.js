import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

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
            // $set: {
            //     refreshToken: undefined
            // }
            $unset:{
                refreshToken: 1
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

const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword , newPassword , confiremPassword} = req.body
    const user = User.findById(req.user?._id) // get this from user auth middelwear
    const isPasswordCorrect = await user.isPassword(oldPassword) // check old password and new password is same or not

    if (!isPasswordCorrect) {
        throw new ApiError(400,"old password is wrong")
    }
    if (!(newPassword === confiremPassword)) {
        throw new ApiError(400,"new password and confirem password is not matched")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200),{},"password changed")
})

const getCurrentUser = asyncHandler(async (req,res) => {
    return res.status(200).json(new ApiResponse(200,req.user,"current user fatched successfully"))
})

const updateAccountDetails = asyncHandler (async (req,res) => {
    const {fullname ,email}=req.body

    if (!fullname || !email) {
        throw new ApiError(400,"all fileds are required")
    }

    const user =await User.findByIdAndUpdate(req.user?._id , {$set: {fullname: fullname,email: email}},{new: true}).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200 ,user,"account updated"))
})

const updateAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path // get a path of  avatar

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
         throw new ApiError(400,"error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { $set:{avatar: avatar.url}},{new:true}).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200,user,"avatar updated"))
})

const updateCoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path // get a path of  avatar

    if (!coverImageLocalPath) {
        throw new ApiError(400,"cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
         throw new ApiError(400,"error while uploading on cover image")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { $set:{coverImage: coverImage.url}},{new:true}).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200,user,"cover image updated"))
})

const getUserChannelProfile = asyncHandler(async (req,res) => {

    const {username} = req.params // get user from url

    if (!username?.trim()) {
        throw new ApiError(400,"username is missing")        
    }

    // User.find({username})
    const channel = await User.aggregate([ //aggregation pipline
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: { // this for count subscribers
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: { // this for count how many user have subscribed
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: { // add filds subscriber count , subscribed or not 
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: { // cond for condition
                        if: {$in: [req.user?._id , "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: { // send this filds to frontend 
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    console.log(channel);
    if (!channel?.length) {
        throw new ApiError(404,"channel not exists")
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"user channel fatched"))
    
})

const getUserWatchHistory = asyncHandler(async (req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos", // here not use model export name but name that mongodb store
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [ // pipline inside pipline of video owner
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },

    ])
    if (!user?.length) {
        throw new ApiError(404,"no watched videos")
    }

    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"watch history fetched"))
})
export {registerUser,
     loginUser, 
     loggedOutUserWhenTokenExpire,
     refershAccessToken, 
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails, 
     updateAvatar,
     updateCoverImage,
     getUserChannelProfile,
     getUserWatchHistory
} 