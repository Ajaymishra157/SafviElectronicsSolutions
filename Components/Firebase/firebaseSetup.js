// FirebaseSetup.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus == messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus == messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log('FCM Permission Enabled');
    getFcmToken();
  }
};

export const saveFcmTokenToFirestore = async () => {
  const token = await messaging().getToken();
  const userId = await AsyncStorage.getItem('admin_id');
  if (userId && token) {
    await firestore().collection('users').doc(userId).set(
      {
        fcmToken: token,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log('FCM Token saved to Firestore');
  }
};

export const getFcmToken = async () => {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
};
