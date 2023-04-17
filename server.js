import express from "express";



const app = express()
app.use(express.static("D:/react/server/app"))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.listen(3000, ()=>{
    console.log("appplication is running on port 3000")

})
app.get("/", (req, res)=>{
    res.sendFile("D:/react/server/app" + "/home.html")
})
app.post("/pushnotify", (req,res)=>{
    let data = req.body;
    console.log(data);
    
    res.json(data);
})            