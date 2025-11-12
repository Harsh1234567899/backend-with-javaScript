import { Router } from "express";
import { loggedOutUserWhenTokenExpire, loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post( upload.fields([{name: "avatar", maxCount: 1},{name: "coverImage", maxCount: 1}]), registerUser)

router.route("/login").post(loginUser)

// secure router middlewear
router.route("/logout").post(verifyJWT, loggedOutUserWhenTokenExpire)

export default router