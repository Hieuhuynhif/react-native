/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {Text, View} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import React, {useEffect} from 'react';
import {Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

async function saveTokenToDatabase(uid: string, token: string) {
  // Add the token to the users datastore
  try {
    const response = await auth()
      .signInWithCustomToken(token)
      .then(async function () {
        const tokenDevice = await getDeviceToken();
        await database()
          .ref(`/users/${uid}`)
          .update({
            token: tokenDevice,
          })
          .then(() => {
            return 'successfull';
          });
      });
    console.log(response);
  } catch (err) {
    console.error(err);
  }
}
async function getDeviceToken() {
  const token = await messaging().getToken();
  messaging().onTokenRefresh(tokens => {
    return tokens;
  });
  return token;
}
async function getCustomToken(userName: string, passWord: string) {
  try {
    const formData = {
      username: userName,
      password: passWord,
    };
    let request = await fetch('http://192.168.1.12:3000/pushnotify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    let data = await request.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
function App(): JSX.Element {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  useEffect(() => {
    messaging().onMessage(async remoteMessage => {
      Alert.alert(
        `${remoteMessage.notification?.title}`,
        remoteMessage.notification?.body,
      );
    });
    const userName = 'mobile';
    const passWord = 'mobile';
    const writeToken = async () => {
      try {
        let data = await getCustomToken(userName, passWord);
        console.log(data);
        await saveTokenToDatabase(userName, data.token);
      } catch (err) {
        console.error(err);
      }
    };
    writeToken();
  }, []);
  return (
    <View>
      <Text>PushNotify</Text>
    </View>
  );
}

export default App;