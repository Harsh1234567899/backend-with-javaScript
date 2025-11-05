import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
const app = express()
const gitHub = {
    "login": "Harsh1234567899",
    "id": 118796163,
    "node_id": "U_kgDOBxSvgw",
    "avatar_url": "https://avatars.githubusercontent.com/u/118796163?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/Harsh1234567899",
    "html_url": "https://github.com/Harsh1234567899",
    "followers_url": "https://api.github.com/users/Harsh1234567899/followers",
    "following_url": "https://api.github.com/users/Harsh1234567899/following{/other_user}",
    "gists_url": "https://api.github.com/users/Harsh1234567899/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/Harsh1234567899/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/Harsh1234567899/subscriptions",
    "organizations_url": "https://api.github.com/users/Harsh1234567899/orgs",
    "repos_url": "https://api.github.com/users/Harsh1234567899/repos",
    "events_url": "https://api.github.com/users/Harsh1234567899/events{/privacy}",
    "received_events_url": "https://api.github.com/users/Harsh1234567899/received_events",
    "type": "User",
    "user_view_type": "public",
    "site_admin": false,
    "name": "Pankhaniya Harsh",
    "company": null,
    "blog": "",
    "location": null,
    "email": null,
    "hireable": null,
    "bio": null,
    "twitter_username": null,
    "public_repos": 5,
    "public_gists": 0,
    "followers": 0,
    "following": 0,
    "created_at": "2022-11-22T06:17:06Z",
    "updated_at": "2025-07-07T17:17:12Z"
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("/twitter", (req, res) => {
    res.send("hello harsh")
})
app.get("/login", (req, res) => {
    res.send('<h1>please login</h1>')
})
app.get("/github", (req, res) => {
    res.json(gitHub)
})
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })
app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})