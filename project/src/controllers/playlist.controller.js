import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const { name, description } = req.body
    if (!(name || description)) {
        throw new ApiError(401, "playlist name and description not found")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    if (!playlist) {
        throw new ApiError(301, "playlist was not create somthing went wrong try again")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!userId) {
        throw new ApiError(301, "user id not found")
    }
    const userplaylist = await Playlist.find({ owner: userId }).populate({
        path: "videos",
        select: "thumbnail"
    })
    if (!userplaylist) {
        throw new ApiError(401, "playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, userplaylist, "playlist fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(301, "playlist not found")
    }
    const playlistVideo = await Playlist.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(playlistId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullname: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    },
                    { $unwind: "$owner"},
                    {
                        $addFields: {
                            views: {
                                $cond: {
                                    if: {$isArray: "$views"},
                                    then: {$size: "$views"},
                                    else: {$ifNull: ["$views", 0]}
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            owner: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        }
    ])
    if (playlistVideo.length == 0) {
        throw new ApiError(401,"no video in this playlist")
    }

    
    return res.status(200).json(new ApiResponse(200, playlistVideo, "playlist found"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId) {
        throw new ApiError(401,"playlist not found")        
    }
    if (!videoId) {
        throw new ApiError(401,"video you want to add is not found")        
    }
     const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { // $addToset is allowed only new one duplicate not allowed // if uses $push: it includes the same videoId again.
                videos: videoId
            }
        },
        { new: true }
    )
    if (!addVideoToPlaylist) {
        throw new ApiError(401,"video not added try again")
    }

    return res.status(200).json(new ApiResponse(200, addVideoToPlaylist, "playlist found"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!playlistId) {
        throw new ApiError(401,"playlist not found")        
    }
    if (!videoId) {
        throw new ApiError(401,"video you want to remove is not found")        
    }
     const deleteVideoToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { 
                videos: videoId
            }
        },
        { new: true }
    )
    if (!deleteVideoToPlaylist) {
        throw new ApiError(401,"video not remove from playlist try again")
    }

    return res.status(200).json(new ApiResponse(200, deleteVideoToPlaylist, "video removed from playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(401,"playlist not found")        
    }
    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletePlaylist) {
        throw new ApiError(301,"playlist not delete try again")
    }
    return res.status(200).json(new ApiResponse(200, deletePlaylist, "playlist deleted "))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!(name || description)) {
        throw new ApiError(401,"name and description not found for update")
    }
    if (!playlistId) {
        throw new ApiError(401,"playlist nor found")
    }
    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )
    if (!updatePlaylist) {
        throw new ApiError(301,"playlist not update try again")
    }
    return res.status(200).json(new ApiResponse(200,updatePlaylist,"playlist updated"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}