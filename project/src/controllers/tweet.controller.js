import mongoose, { isValidObjectId, Mongoose } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweetText} = req.body
    if (!tweetText) {
        throw new ApiError(401,"add tweet to post")
    }
    const tweet = await Tweet.create({
        content : tweetText,
        owner: req.user._id
    })
    return res.status(200).json(new ApiResponse(200,tweet,"tweet is created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if (!userId) {
        throw new ApiError(401,"user id not found for fatch tweets")
    }
    const userTweets = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "usertweets"
            }
        },
        { $unwind: "$userTweets"},
        {
            $group: {
                _id: "$_id",
                fullName: { $first: "$fullName" },
                username: { $first: "$username" },
                avatar: { $first: "$avatar" },
                usertweets: { $push: "$usertweets" }
            }
        },
        {
            $project: {
                fullname: 1,
                usertweets: 1,
                avatar: 1,
                username: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,userTweets,""))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(401,"tweet id not found")
    }
    
    const {newTweetText} = req.body
    if (!newTweetText) {
        throw new ApiError(401,"please write new text to update")
    }

    const newTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: {
                content: newTweetText
            }
        },
        {
            new:true
        }
    )
    return res.status(200).json(new ApiResponse(200,newTweet,"tweet is updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(401,"tweet id not found")
    }
    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)
    return res.status(200).json(new ApiResponse(200,deleteTweet,"tweet is deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}