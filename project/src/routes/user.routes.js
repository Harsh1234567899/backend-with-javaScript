import { Router } from "express";
import { loggedOutUserWhenTokenExpire, loginUser, registerUser, refershAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post( upload.fields([{name: "avatar", maxCount: 1},{name: "coverImage", maxCount: 1}]), registerUser)

router.route("/login").post(loginUser)

// secure router middlewear
router.route("/logout").post(verifyJWT, loggedOutUserWhenTokenExpire)
router.route("/refresh-token").post(refershAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateAvatar)
router.route("/update-coverimage").patch(verifyJWT,upload.single("coverImage"), updateCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/watch-history").get(verifyJWT ,getUserWatchHistory)

export default router