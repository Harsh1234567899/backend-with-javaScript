import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "video id is invalid")
    }
    const videoLike = await Like.findOne({video: videoId, likedBy: req.user._id})
    if (videoLike) {
        await videoLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, videoLike, "video unliked successfully"))
    }
    const newLike = await Like.create({video: videoId, likedBy: req.user._id})
    return res.status(200).json(new ApiResponse(200, newLike, "video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400,"comment id is invalid")
    }
    const commentLike = await Like.findOne({comment: commentId, likedBy: req.user._id})
    if (commentLike) {
        await commentLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, commentLike, "comment unliked successfully"))
    }
    const newLike = await Like.create({comment: commentId, likedBy: req.user._id})
    return res.status(200).json(new ApiResponse(200, newLike, "comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"twwet id is invalid")
    }
    const tweetLike = await Like.findOne({tweet: tweetId, likedBy: req.user._id})
    if (tweetLike) {
        await tweetLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, tweetLike, "tweet unliked successfully"))
    }
    const newLike = await Like.create({tweet: tweetId, likedBy: req.user._id})
    return res.status(200).json(new ApiResponse(200, newLike, "tweet liked successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // const {videoId} = req.params
    // if (!videoId) {
    //     throw new ApiError(400, "video id is invalid")
    // }
    const getAllVideoLike = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "videoDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "likedBy",
                as:"channel"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $project: {
                likedAt: "$createdAt",
                videoDetails: 1,
                channel: {
                    username: { $getField: { field: "username", input: { $arrayElemAt: ["$channel", 0] } } },
                    avatar: { $getField: { field: "avatar", input: { $arrayElemAt: ["$channel", 0] } } }
                }
            }
        }
    ])
    if (!getAllVideoLike) {
        throw new ApiError(400,"liked Video fatching failed")
    }
    return res.status(200).json(new ApiResponse(200,getAllVideoLike,"video liked fatched"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}