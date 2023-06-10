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
    (userName == "mobile-1" && passWord == "mobile-1") ||
    (userName == "mobile-2" && passWord == "mobile-2")
  ) {
    try {
      let customToken = await createCustomToken(userName);
      const session = req.session;
      session.username = userName;
      session.token = customToken;
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
  let today = new Date();
  let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date + " " + time;

  if (data.touser) {
    try {
      const reciever = await admin
        .database()
        .ref(`users/${data.touser}/info`)
        .once("value")
        .then((snapshot) => {
          return snapshot.val();
        });
      if (!reciever) {
        throw "Reciever is NOT exist";
      }
      try {
        let message = `Hello ${reciever.name}, ${data.message}`;
        await admin.messaging().sendMulticast({
          tokens: [reciever.token],
          notification: {
            title: session.username,
            body: message,
          },
        });

        await admin
          .database()
          .ref(`users/${session.username}/messages/${data.touser}/`)
          .push()
          .set({
            date: dateTime,
            touser: reciever.username,
            name: reciever.name,
            age: reciever.age,
            message: message,
          });
        res.json({ status: "200" });
      } catch (err) {
        res.json({ error: "Cannot sent to device" });
      }
    } catch (err) {
      return res.json({ error: err });
    }
  } else {
    try {
      const recievers = await admin
        .database()
        .ref(`users`)
        .once("value")
        .then((snapshot) => {
          return snapshot.val();
        });
      if (!recievers) {
        throw "not Exist";
      }
      const keys = Object.keys(recievers);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (
          recievers[key].info &&
          recievers[key].info.username != session.username
        ) {
          let age = recievers[key].info.age;
          if (age >= data.from && age <= data.to) {
            let message = `Hello ${recievers[key].info.name}, ${data.message}`;
            await admin.messaging().sendMulticast({
              tokens: [recievers[key].info.token],
              notification: {
                title: session.username,
                body: message,
              },
            });
            await admin
              .database()
              .ref(`users/${session.username}/messages/${key}`)
              .push()
              .set({
                date: dateTime,
                touser: recievers[key].info.username,
                name: recievers[key].info.name,
                age: recievers[key].info.age,
                message: message,
              });
          }
        }
      }

      let test = await admin
        .database()
        .ref(`users/${session.username}/messages`)
        .once("value")
        .then((snapshot) => {
          return snapshot.val();
        });
      console.log(await test);
      return res.json({ status: "200" });
    } catch (err) {
      return res.json({ error: err });
    }
  }
});

app.post("/gethistory", async (req, res) => {
  const session = req.session;
  const key = req.body.key;
  try {
    if (key) {
      const history = await admin
        .database()
        .ref(`users/${session.username}/messages/${key}`)
        .once("value")
        .then((snapshot) => {
          return snapshot.val();
        });
      return res.json(await history);
    } else {
      const history = await admin
        .database()
        .ref(`users/${session.username}/messages`)
        .once("value")
        .then((snapshot) => {
          return snapshot.val();
        });
      return res.json(await history);
    }
  } catch (err) {
    return res.json({ error: "server error" });
  }
});
