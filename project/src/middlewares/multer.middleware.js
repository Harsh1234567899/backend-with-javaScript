import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) { // cb = callback
    // cb(null, '../project/public/assets') // give full path this will give error
    cb(null, 'D:/java_script/backend-with-javaScript/project/public/assets') // multer store file in this for some time 
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // logic to change file name
    // callback(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage, })