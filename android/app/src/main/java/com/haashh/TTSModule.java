package com.safvielectricalsolutions;

import android.content.Intent;
import android.content.Context;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class TTSModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public TTSModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "TTSModule";
    }

    @ReactMethod
    public void speakText(String text) {
        Intent serviceIntent = new Intent(reactContext, TTSService.class);
        serviceIntent.putExtra("text", text);
        ContextCompat.startForegroundService(reactContext, serviceIntent);
    }
}
