import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const videoDocument = asyncHandler(async (req,res,next)=> {
    const {videoId} = req.params
    if (!videoId) {
        throw new ApiError(404,"video id not found")
    }
    const video =await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404,"video not found")
    }
    req.video = video
    next()
})
export {videoDocument}