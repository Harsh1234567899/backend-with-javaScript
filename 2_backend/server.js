import express from 'express';
// require('dotenv').config({ path: 'BACKEND-WITH-JAVASCRIPT/.env' })
import dotenv from 'dotenv'
dotenv.config()

const  app = express()

app.get('/',(req,res)=>{
    res.send("server is ready")
})
app.get('/api/jokes',(req,res)=>{
    const jokes = [
        {
            id: 1,
            title: "1 joke",
            content: "this is first joke"
        },
        {
            id: 2,
            title: "2 joke",
            content: "this is 2 joke"
        },
        {
            id: 3,
            title: "3 joke",
            content: "this is 3 joke"
        }
    ]
    res.send(jokes)
})

// const port = process.env.PORT || 3000
const port = process.env.PORT 


app.listen(port,()=>{
    console.log(`server port is running ${port}`);
    
})