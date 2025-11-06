import messaging from '@react-native-firebase/messaging';
import Tts from 'react-native-tts';
import notifee, { AndroidImportance } from '@notifee/react-native';
// import { NativeModules } from 'react-native';
// const { TTSServiceModule } = NativeModules;

// ✅ Setup notification channel (important for Android 8+)
export const setupNotificationChannel = async () => {
  try {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      sound: 'default',
      importance: notifee.AndroidImportance.HIGH,
    });
    console.log('Notification channel created');
  } catch (error) {
    console.log('Error creating notification channel:', error);
  }
};

export const setupNotificationListeners = () => {
  const speakText = async (body) => {
    try {
      await Tts.getInitStatus();
      Tts.stop();
      // Tts.setDefaultLanguage('hi-IN');
      // Tts.setDefaultVoice('hi-in-x-hia-local');
      Tts.speak(body);
    } catch (err) {
      console.log('TTS Init error:', err);
    }
  };

  // Foreground notification
  messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage);

    const { title, body } = remoteMessage.notification || remoteMessage.data || {};

    if (body) {
      speakText(body);
    }
  });

  // Background notification
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background notification:', remoteMessage);

    const { body } = remoteMessage.notification || remoteMessage.data || {};
    if (body) {
      // Manually show notification
      await notifee.displayNotification({
        title: title || 'New Order Created!',
        body: body,
        android: {
          channelId: 'default',
          asForegroundService: true,
          smallIcon: 'play_store_512', // Ensure this icon exists
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
      });

      speakText(body);
      // TTSServiceModule.speakInBackground(body); 
    }
  });

  // Notification opened from background
  // messaging().onNotificationOpenedApp(remoteMessage => {
  //   console.log('Notification opened:', remoteMessage);

  //   const { body } = remoteMessage.notification || remoteMessage.data || {};
  //   if (body) {
  //     speakText(body);
  //   }
  // });

  // Notification opened from quit state
  // messaging().getInitialNotification().then(remoteMessage => {
  //   if (remoteMessage?.notification) {
  //     const { body } = remoteMessage.notification || remoteMessage.data || {};
  //     if (body) {
  //       speakText(body);
  //     }
  //   }
  // });
};
