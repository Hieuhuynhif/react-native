import { initializeApp, credential as _credential, messaging, database } from 'firebase-admin';
import serviceAccount from "./hieuhuynh-16f60-firebase-adminsdk-qc7lb-384c57ffdb.json";

initializeApp({
    credential: _credential.cert(serviceAccount),
    // The database URL depends on the location of the database
    databaseURL: "https://hieuhuynh-16f60-default-rtdb.asia-southeast1.firebasedatabase.app/"
  });
  
  const uid = "some-id"
function createCustomToken(uid)
{
    getAuth()
    .createCustomToken(uid)
    .then((customToken) => {
    // Send token back to client

    })
    .catch((error) => {
    console.log('Error creating custom token:', error);
    });
}
async function push(token, title, body)
{
    pushmes = await messaging().send({
        token: token,
        notification: {
            title: title,
            body:   body,
        },
    });
    return pushmes;
}

const pushNotify = (id, title, body)=>{
    var db = database();
    var ref = db.ref(`user/${id}/token`);
    ref.once("value", (snapshot)=>{
        console.log(snapshot.val());
        push(snapshot.val().token, title, body);
    });
}
export default {pushNotify,createCustomToken};
