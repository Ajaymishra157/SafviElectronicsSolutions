package com.safvielectricalsolutions;

import android.speech.tts.Voice;
import android.app.Service;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;

import java.util.Locale;

public class TTSService extends Service implements TextToSpeech.OnInitListener {

    private static final String CHANNEL_ID = "TTS_CHANNEL";
    private static final String TAG = "TTSService";

    private TextToSpeech tts;
    private String textToSpeak;
    private PowerManager.WakeLock wakeLock;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        textToSpeak = intent.getStringExtra("text");

        Log.d(TAG, "onStartCommand called with text: " + textToSpeak);

        createNotificationChannel();

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Speaking Message")
                .setContentText(textToSpeak)
                .setSmallIcon(R.drawable.play_store_512) // Make sure this icon exists
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();

        startForeground(1, notification);

        // Acquire WakeLock to keep CPU awake while speaking
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (wakeLock == null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, TAG + ":WakeLock");
        }
        if (!wakeLock.isHeld()) {
            wakeLock.acquire(60000); // keep awake for max 60 seconds
        }

        if (tts == null) {
            tts = new TextToSpeech(this, this);
        } else {
            speakText();
        }

        // Request audio focus (optional but recommended)
        AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        int result = audioManager.requestAudioFocus(focusChange -> {
            // You can handle audio focus changes here if needed
        }, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);

        if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
            Log.d(TAG, "Audio focus granted");
        } else {
            Log.e(TAG, "Audio focus NOT granted");
        }

        return START_NOT_STICKY;
    }

    @Override
    public void onInit(int status) {
        Log.d(TAG, "TextToSpeech onInit status: " + status);

        if (status == TextToSpeech.SUCCESS) {
            // Set audio attributes (optional but recommended)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build();
                tts.setAudioAttributes(audioAttributes);
            }

            Locale hindiLocale = new Locale("hi", "IN");
            int langResult = tts.setLanguage(hindiLocale);

            if (langResult == TextToSpeech.LANG_MISSING_DATA || langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e(TAG, "Hindi language not supported for TTS");
                return;
            }

            // Optional: force Hindi voice if available
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                for (Voice voice : tts.getVoices()) {
                    Log.d(TAG, "Voice found: " + voice.getName() + " | Locale: " + voice.getLocale());

                    if (voice.getLocale().equals(hindiLocale) && voice.getName().toLowerCase().contains("hi-in")) {
                        tts.setVoice(voice);
                        Log.d(TAG, "Using Hindi voice: " + voice.getName());
                        break;
                    }
                }
            }

            speakText();
        } else {
            Log.e(TAG, "TTS initialization failed with status: " + status);
        }
    }

    private void speakText() {
        if (tts != null && textToSpeak != null) {
            Log.d(TAG, "Speaking text: " + textToSpeak);
            tts.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null, "tts1");
        } else {
            Log.e(TAG, "TTS or textToSpeak is null");
        }
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "Service destroyed");
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "TTS Foreground Service",
                    NotificationManager.IMPORTANCE_HIGH);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
}
