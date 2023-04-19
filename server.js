import express from 'express';
import {createCustomToken} from './pushNotifyModule.js';
// import fs from 'fs'
// import https from 'https'
// const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

// const credentials = {key: privateKey, cert: certificate};
const app = express();
 
// your express configuration here

app.use(express.static("D:/Workspace/React/react-native/server/app"))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.get("/", (req, res)=>{
    res.sendFile("D:/Workspace/React/react-native/server/app" + "/home.html")
})
app.post("/pushnotify", async(req,res)=>{
    let data = req.body;
    let userName    =   data.username;
    let passWord    =   data.password;
    console.log(data);
    if((userName == "web" && passWord == "web") || (userName == "mobile" && passWord == "mobile"))
    {
        let customToken = await createCustomToken(userName);

        res.json({token:customToken})
    }
    else{
        res.json({token: "error"})
    }
})
// const httpsServer = https.createServer(credentials, app);
app.listen(3000, ()=>{
    console.log("Https-server is running on port 3000")
});     