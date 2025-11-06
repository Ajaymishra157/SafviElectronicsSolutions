/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import Tts from 'react-native-tts';

// ✅ Background message handler (headless mode)
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📥 Background message handled in index.js:', remoteMessage);

    const body = remoteMessage?.data?.body || '';
    if (body) {
        try {
            await Tts.getInitStatus();
            Tts.stop();
            // Tts.setDefaultLanguage('hi-IN');
            // Tts.setDefaultVoice('hi-in-x-hia-local');

            Tts.speak(body);
        } catch (err) {
            console.log('TTS Init error (headless):', err);
        }
    }
});

AppRegistry.registerComponent(appName, () => App);
