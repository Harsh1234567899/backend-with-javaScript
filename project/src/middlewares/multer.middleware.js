import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/assets') // multer store file in this for some time 
  },
  filename: function (req, file, callback) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // logic to change file name
    // callback(null, file.fieldname + '-' + uniqueSuffix)
    callback(null, file.originalname)
  }
})

export const upload = multer({ storage, })