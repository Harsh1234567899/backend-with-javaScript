require('dotenv').config()
const express = require('express')
const app = express()


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("/twitter", (req,res) => {
    res.send("hello harsh")
})
app.get("/login",(req,res)=>{
    res.send('<h1>please login</h1>')
})
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })
app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})