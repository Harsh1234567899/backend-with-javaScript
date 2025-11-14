import {v2 as cloudinary} from "cloudinary";
import fs from "fs"
import { extractPublicId } from 'cloudinary-build-url';
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
})
// console.log(process.env.CLOUDINARY_NAME,process.env.CLOUDINARY_API,process.env.CLOUDINARY_SECRET);


const uploadOnCloudinary = async (localFilePath , folder = "") => {
    try {
        if (!localFilePath) return null // check file path is there or not
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folder // use to give aa folder path
        })
        // console.log("cloudinary response",response);
        
        //file upload success
        // console.log("fill upload in cloudinary", response.url); // give a url of the file uplload 
        fs.unlinkSync(localFilePath);
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
        }
        return null

    }
}

const deleteOnCloudinary = async (imageURL) => {
    try {
        if (!imageURL) {
            throw new ApiError(404, "Image Invalid")
        }
        //delete the file on cloudinary
        const publicId = extractPublicId(imageURL);
        
        const response = await cloudinary.uploader.destroy(publicId);
        if(response.result != 'ok'){
            throw new ApiError(404, "Old Image Deletion Failed from Cloudinary")
        }

        // file has been deleted
        return 1;

    } catch (error) {
        return null;
    }
}



const replaceOnCloudinary = async (localFilePath, oldFileUrl, folder = "") => {
    const newFile = await uploadOnCloudinary(localFilePath, folder);
    if (!newFile?.url) { 
        throw new ApiError(401,"new file is not upload")
    };

    if (oldFileUrl) await deleteOnCloudinary(oldFileUrl);
    
    return newFile;
};

export {uploadOnCloudinary  ,replaceOnCloudinary ,deleteOnCloudinary}
