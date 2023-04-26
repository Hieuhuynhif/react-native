import express from 'express';
import {createCustomToken} from './pushNotifyModule.js';
import admin from 'firebase-admin';
const app = express();
app.listen(3000, ()=>{
    console.log("Http-server is running on port 3000");
})
app.use(express.static("D:/Workspace/React/server/app"))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/", (req, res)=>{
    res.sendFile("D:/Workspace/React/server/app" + "/home.html")
})
app.post("/pushnotify", async(req,res)=>{
    let data = req.body;
    let userName    =   data.username;
    let passWord    =   data.password;
    console.log(data);
    if((userName == "web" && passWord == "web") || (userName == "mobile" && passWord == "mobile"))
    {
        let customToken = await createCustomToken(userName);
        if(data.touser)
        {
            try
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
                return res.json({token:customToken});
            }
            catch(error)
            {
                console.error(error);
                return res.json({error: "Receiver is not exist"})
            }
        }
        else
        {
            return res.json({token:customToken});
        }
    }
    else{
        res.json({error: "Username or password is incorrect"})
    }
})
