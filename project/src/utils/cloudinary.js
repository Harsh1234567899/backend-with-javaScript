import {v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null // check file path is there or not
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file upload success
        console.log("fill upload in cloudinary", response.url); // give a url of the file uplload 
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null

    }
}

export {uploadOnCloudinary}