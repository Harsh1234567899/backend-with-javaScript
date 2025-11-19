import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()
app.use(cors())

app.use(express.json({limit: "100kb"}))
app.use(express.urlencoded({extended: true,limit: "100kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes
import userRouter from "./routes/user.routes.js";
//routes declaration
app.use("/api/v1/users", userRouter)

import videoRouter from "./routes/video.routes.js"
app.use("/api/v2/videos", videoRouter)

import tweetsRouter from "./routes/tweet.routes.js"
app.use("/api/v3/tweets", tweetsRouter)

import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v4/playlist", playlistRouter)

export { app }