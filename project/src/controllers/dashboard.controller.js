import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user = req.user._id
    const userStats = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(user) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videosDetails"
            }
        },
        {
            $lookup: {
                from: "tweets",
                foreignField: "owner",
                localField: "_id",
                as: "tweetsDetails"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriptionsDetails"
            }
        },
        // {
        //     $lookup: {
        //         from: "likes",
        //         foreignField: "likedBy",
        //         localField: "_id",
        //         as: "likesDetails"
        //     }
        // },
        {
            $lookup: {
                from: "likes",
                let: { userVideos: "$videosDetails._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$video", "$$userVideos"] }
                        }
                    }
                ],
                as: "likesDetails"
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { usertweets: "$tweetsDetails._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$tweet", "$$usertweets"] }
                        }
                    }
                ],
                as: "tweetlikesDetails"
            }
        },
        {
            $addFields: {
                totalViews: { 
                    $sum: { 
                        $map: { 
                            input: "$videosDetails", 
                            as: "video", 
                            in: {
                                $cond: {
                                    if: { $isArray: "$$video.views" },
                                    then: { $size: "$$video.views" },
                                    else: { $ifNull: ["$$video.views", 0] }
                                }
                            }
                        } 
                    } 
                },
                tweetlikes: {$size: "$tweetlikesDetails"},
                totalLikes: { $size: "$likesDetails" }, // count likes
                totalSubscribers: { $size: "$subscriptionsDetails" } // count subscribers
            }
        }, 
        {
            $project: {
                username: 1,
                totalLikes: 1,
                tweetlikes: 1,
                totalSubscribers: 1,
                totalViews: 1,
                "videosDetails._id": 1,
                "videosDetails.isPublished": 1,
                "videosDetails.thumbnail": 1,
                "videosDetails.title": 1,
                "videosDetails.description": 1,
                "videosDetails.createdAt": 1
            }
        }

    ]);
    return res.status(200).json(new ApiResponse(200,userStats,"user channel stats fatched"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(400,"you are not authorized user")
    }
    const userVideo = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {$addFields: {
                views: { // count every object id and return count of totel id as views
                    $cond: {
                        if: { $isArray: "$views" },
                        then: { $size: "$views" },
                        else: { $ifNull: ["$views", 0] }
                    }
                }
            }
        }
    ])
    if (!userVideo) {
        throw new ApiError(300,"video fatching failed")
    }
    return res.status(200).json( new ApiResponse(200,userVideo,"video fatched"))
})

export {
    getChannelStats, 
    getChannelVideos
    }