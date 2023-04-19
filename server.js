import express from 'express';
import {createCustomToken} from './pushNotifyModule.js';
import admin from 'firebase-admin';
const app = express();
app.listen(3000, ()=>{
    console.log("Http-server is running on port 3000");
})
app.use(express.static("D:/React/server/app"))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/", (req, res)=>{
    res.sendFile("D:/React/server/app" + "/home.html")
})
app.post("/pushnotify", async(req,res)=>{
    let data = req.body;
    let userName    =   data.username;
    let passWord    =   data.password;
    console.log(data);
    if((userName == "web" && passWord == "web") || (userName == "mobile" && passWord == "mobile"))
    {
        let customToken = await createCustomToken(userName);
        res.json({token:customToken});
        if(data.touser)
        {
            const tokenTouser = await admin.database()
            .ref(`users/${data.touser}`)
            .once('value')
            .then(snapshot => {
              console.log('User data: ', snapshot.val());
              return snapshot.val().token;
            });

            await admin.messaging().sendMulticast({
                tokens: [
                    tokenTouser
                ],
                notification: {
                  title: data.title,
                  body: data.body,
                },
              });
        }
    }
    else{
        res.json({token: "error"})
    }
})
