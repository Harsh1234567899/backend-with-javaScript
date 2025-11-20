import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "channel id is invalid")
    }

    const isSubscribed = await Subscription.findOne({ channel: channelId, subscriber: req.user._id });

    if (req.user._id == channelId) {
        throw new ApiError(400, "you subscribed your own channel")
    }

    if (!isSubscribed) {
        const channel = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(200, channel, "Subscribed channel")
            )

    } else {
        const channel = await isSubscribed.deleteOne();

        return res
            .status(200)
            .json(
                new ApiResponse(200, channel, "Unsubscribed channel")
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "channel id is invalid")
    }
    const getUserSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribers",
                foreignField: "_id",
                as: "subscribersDetails"
            }
        },
        {
            $unwind: "$subscribersDetails"
        },
        {
            $project: {
                _id: 0,
                avatar: "$subscribersDetails.avatar",
                username: "$subscribersDetails.username",
                fullname: "$subscribersDetails.fullname"
            }
        }
    ])
    if (!getUserSubscribers) {
        throw new ApiError(301,"subscribers not found")
    }
    return res.status(200).json(200,getUserSubscribers,"subsribers fetched")
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "subscriber id is invalid")
    }
    const getUserSubscribedChannel = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribers",
                foreignField: "_id",
                as: "subscribersDetails"
            }
        },
        {
            $addFields: "$subscribersDetails"
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                username: "$channelDetails.username",
                avatar: "channelDetails.avatar",
                fullname: "channelDetails.fullname",
                subscriberCount: 1
            }
        }
    ])
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}