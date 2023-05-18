import express from "express";
import { createCustomToken } from "./pushNotifyModule.js";
import admin from "firebase-admin";
import session from "express-session";

const app = express();
app.listen(3000, () => {
  console.log("Http-server is running on port 3000");
});
app.use(express.static("D:/Workspace/React/react-native/server/app"));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(session({ secret: "Shh, its a secret!" }));

app.get("/check", (req, res) => {
  const session = req.session;
  if (session.username) {
    res.json({ sess: session });
  }
});
app.get("/logout", (req, res) => {
  const session = req.session;
  if (session.username) {
    session.destroy();
    res.json({ status: "logout" });
  }
});

app.get("/", (req, res) => {
  const session = req.session;

  if (session.username) {
    res.sendFile("D:/Workspace/React/react-native/server/app" + "/home.html");
  } else {
    res.sendFile("D:/Workspace/React/react-native/server/app" + "/login.html");
  }
});

app.post("/login", async (req, res) => {
  let data = req.body;
  let userName = data.username;
  let passWord = data.password;
  console.log(data);
  if (
    (userName == "web" && passWord == "web") ||
    (userName == "mobile" && passWord == "mobile")
  ) {
    try {
      let customToken = await createCustomToken(userName);
      const session = req.session;
      session.username = userName;
      session.token = customToken;
      console.log(session.token);
      return res.json({ customtoken: customToken });
    } catch (error) {
      console.error(error);
      return res.json({ error: "Database connection failed" });
    }
  } else {
    res.json({ error: "Username or password is incorrect" });
  }
});

app.post("/pushnotify", async (req, res) => {
  let data = req.body;
  const session = req.session;

  try {
    const tokenTouser = await admin
      .database()
      .ref(`users/${data.touser}`)
      .once("value")
      .then((snapshot) => {
        console.log("User data: ", snapshot.val());
        return snapshot.val().token;
      });

    try {
      await admin.messaging().sendMulticast({
        tokens: [tokenTouser],
        notification: {
          title: session.username,
          body: data.message,
        },
      });

      var today = new Date();
      var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      await admin
        .database()
        .ref(`users/${session.username}/messages`)
        .push()
        .set({
          date: dateTime,
          touser: data.touser,
          message: data.message,
        });
    } catch (err) {
      console.log(err);
      res.json({ error: "Cannot save on History" });
    }

    return res.json({ status: "signed" });
  } catch (err) {
    console.error(err);
    return res.json({ error: "Reciever is NOT exist" });
  }
});

app.get("/gethistory", async(req, res)=>{
  const session = req.session;

  try {
    const history = await admin
      .database()
      .ref(`users/${session.username}/messages`)
      .once("value")
      .then((snapshot) => {
        console.log("User data: ", snapshot.val());
        return snapshot.val();
      });
      return res.json(history);
    }
  catch(err)
  {
    return res.json({error: "server error"})
  }
})
