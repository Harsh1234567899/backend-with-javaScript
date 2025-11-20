import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// content: {
//             type: String,
//             required: true
//         },
//         video: {
//             type: Schema.Types.ObjectId,
//             ref: "Video"
//         },
//         owner: {
//             type: Schema.Types.ObjectId,
//             ref: "User"
//         }
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "video id is not valid")
    }
    const options = {
        page,
        limit
    }
    const comments = await Comment.aggregate([
        {
            $match:{_id:  new mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "commentsOwner",
                foreignField: "_id",
                as: "videoCommenter"
            }
        },
        {
            $unwind: "$videoCommenter"
        },
        {
            $project: {
                _id: 1,
                content: 1,
                "videoCommenter._id": 1,
                "videoCommenter.username": 1,
                "videoCommenter.fullname": 1,
                "videoCommenter.avatar": 1,
                "videoCommenter.createdAt": 1
            }
        }
    ])
    if (!comments) {
        throw new ApiError(401, "no comments found")
    }
    const getAllComment = await Comment.aggregatePaginate(comments, options) //aggregatePaginate is help to give result base on limmt that set by us in options // this will return in that way first 1-10 , 11-20 based on limit set
    return res.status(200).json(new ApiResponse(200, getAllComment, "all coment fatched"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    const userId = req.user._id

    if (!videoId) {
        throw new ApiError(400, "video id is invalid")
    }
    if (!content) {
        throw new ApiError(401, "type some content to comment")
    }
    if (!userId) {
        throw new ApiError(500, "first login to comment")
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })
    await comment.save()
    return res.status(200).json(new ApiResponse(200,comment,"comment is post"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if(!commentId){
        throw new ApiError(401,"comment id not found or this id waas not valid")
    }
    if (!content) {
        throw new ApiError(401,"add some new content to update comment")
    }
    const updatedCommnet = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )
    if (!updatedCommnet) {
        throw new ApiError(301,"update comment failed")
    }
    res.status(200).json(new ApiResponse(200,updatedCommnet , "comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(401,"comment id not found or this id waas not valid")
    }
    const deleteAComment = await Comment.findByIdAndDelete(commentId)

    if (!deleteAComment) {
        throw new ApiError(300,"comment deletion is failed")
    }
    res.status(200).json(new ApiResponse(200,deleteAComment,"comment deleted"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}