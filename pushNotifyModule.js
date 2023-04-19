import admin from "firebase-admin";
import serviceAccount from "./hieuhuynh-16f60-firebase-adminsdk-qc7lb-c191b4a44f.json" assert {type: 'json'};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hieuhuynh-16f60-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
async function createCustomToken(uid)
{
    try
    {
        let token =  await admin.auth()
        .createCustomToken(uid);
        return token;
    }
    catch(error){
        console.log('Error creating custom token:', error);
    }
}

async function pushNotify (user, title, body){
    var db = database();
    var ref = db.ref(`users/${user}`);
    await ref.once("value", (snapshot)=>{
        console.log(snapshot.val());
        messaging().send({
            token: snapshot.val().token,
            notification: {
                title: title,
                body:   body,
            },
        });
    });
}
export {createCustomToken, pushNotify};
