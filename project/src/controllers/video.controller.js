import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, replaceOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if ([title , description].some((field)=>  field?.trim() === "") ){ // check fileds are empty or not
        throw new ApiError(400, "All fiels required");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path; // check the local path
    let thumbnailLocalPath
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
         thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    } // folder path to upload in cloudinary

    if (!videoLocalPath) {
        throw new ApiError(400,"video file is required 1")
    }

    const videoupload = await uploadOnCloudinary(videoLocalPath, "chai-bakend-youtubeclone-code/videos") 
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath , "chai-bakend-youtubeclone-code/thumbnail");

    if (!(videoupload || thumbnail)) {
        throw new ApiError(400, "video or thumbnail file is required 2") // check video is upload or not
    }

    const video = await Video.create({ // store user in  db
        videoFile: videoupload.url, // save only url
        thumbnail: thumbnail?.url || "", // check cover image is there or not or in empty case store nothing
        title,
        description,
        duration: videoupload.duration,
        owner: req.user._id,
    })
    await video.save()

    return res.status(201).json( // send response to db
        new ApiResponse(200,video ,"video uploaded ...")
    )
})

const getVideoById = asyncHandler(async (req, res , next) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!(videoId)) {
        throw new ApiError(400, "Video Id is invalid");
    }

    // Add user to views array only if not already present (unique view tracking)
    await Promise.all([
        Video.findByIdAndUpdate(
            videoId, 
            { $addToSet: { views: req.user._id },
        //  $inc: {
        //     views: {
        //         $cond: [
        //             { $in: [req.user._id, "$viewedBy"] },
        //             0,  // user has already viewed → do NOT increment
        //             1   // new viewer → increment
        //         ]
        //     }
        // }
        } // $addToSet ensures no duplicates
        ),
        User.findByIdAndUpdate(
            req.user._id,
            { $push: { watchHistory: videoId } }
        )
    ]);
    
    const video = await Video.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        { $unwind: "$channel" },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                views: {
                    $cond: {
                        if: { $isArray: "$views" },
                        then: { $size: "$views" },
                        else: { $ifNull: ["$views", 0] }
                    }
                },
                "channel.subscribersCount": { $size: "$subscribers" },
                "channel.isSubscribed": {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                "channel._id": 1,
                "channel.avatar": 1,
                "channel.fullName": 1,
                "channel.subscribersCount": 1,
                "channel.username": 1,
                "channel.isSubscribed": 1,

                createdAt: 1,
                description: 1,
                duration: 1,
                likesCount: 1,
                title: 1,
                videoFile: 1,
                views: 1,
                isPublished: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video Details Fetched Successfully")
        )
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const {title , description} = req.body
    if (!(title || description)){
        throw new ApiError(400,"titel and description is invalid")
    }

    const thumbnailLocalPath = req.file?.path // get a path of  avatar
    // const thumbnaildbpath = req.user?.thumbnail
    const thumbnaildbpath = req.video?.thumbnail
    
    if (!thumbnailLocalPath) {
        throw new ApiError(400,"thumbnail file is missing")
    }
    const updateThumbnail = await replaceOnCloudinary(thumbnailLocalPath , thumbnaildbpath , "chai-bakend-youtubeclone-code/thumbnail")
    if (!updateThumbnail.url) {
         throw new ApiError(400,"error while uploading new thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(req.video._id , {$set: {title: title,description: description,thumbnail: updateThumbnail.url}},{new: true})

    return res.status(200).json(new ApiResponse(200 ,updatedVideo,"video updated"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const video = req.video
    if (!video) {
        throw new ApiError(404,"video not found")
    }
    
    //TODO: delete video
    const deleteVideo = await deleteOnCloudinary(req.video.videoFile)
    
    if (!deleteVideo) {
        throw new ApiError(300,"video was not delete")
    }
    const thumbnail = await deleteOnCloudinary(video.thumbnail)
        if (!thumbnail) {
        throw new ApiError(300,"thumbnail not delete")
    }
    const deletefromDb = await video.deleteOne();
    return res.status(200).json(new ApiResponse(200,deletefromDb ,"video is deleted"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}