import React, { useEffect } from 'react';
import Mainstack from './Components/ManageNavigation/Mainstack';
import ZoomWrapper from './Components/Commoncomponent/ZoomWrapper';
import { requestUserPermission } from './Components/Firebase/firebaseSetup';
import { setupNotificationChannel, setupNotificationListeners } from './Components/services/NotificationService';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

const App = () => {

  useEffect(() => {
    requestNotificationPermission();
    setupNotificationChannel();
    setupNotificationListeners();
  }, []);

   // 🛎️ Notification Permission Request Function
   const requestNotificationPermission = async () => {
    console.log('🔔 Requesting notification permission...');

    if (Platform.OS == 'ios') {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ iOS: Notification permission granted');
        } else {
          Alert.alert(
            'Permission Denied',
            'Please enable notifications in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      } catch (error) {
        console.error('❌ iOS permission error:', error);
      }

    } else if (Platform.OS == 'android') {
      if (Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('✅ Android: Notification permission granted');
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              'Permission Blocked',
              'Please enable notifications manually in Settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
          } else {
            Alert.alert(
              'Permission Denied',
              'Notification permission is required to receive notification.',
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('❌ Android permission error:', error);
        }
      } else {
        console.log('✅ Android < 13: No notification permission needed');
      }
    }
  };

  return (
    <ZoomWrapper>
      <Mainstack />
    </ZoomWrapper>
  );
};

export default App;
