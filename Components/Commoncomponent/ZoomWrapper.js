import React, { useRef, useState } from "react";
import { Dimensions } from "react-native";
import {GestureHandlerRootView,PinchGestureHandler,PanGestureHandler,} from "react-native-gesture-handler";
import Animated, {useAnimatedGestureHandler,useAnimatedStyle,useSharedValue,withTiming,runOnJS,} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const ZoomWrapper = ({ children }) => {
  const panRef = useRef();
  const pinchRef = useRef();

  const scale = useSharedValue(1);
  const lastScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);

  // React state to enable pan gesture
  const [panEnabled, setPanEnabled] = useState(false);

  const setPanEnabledFromWorklet = (enabled) => {
    setPanEnabled(enabled);
  };

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startScale = lastScale.value;
    },
    onActive: (event, ctx) => {
      let newScale = ctx.startScale * event.scale;
  
      // Temporarily allow small scale (< 1) so we can animate it back
      scale.value = newScale;
  
      runOnJS(setPanEnabledFromWorklet)(newScale > 1);
    },
    onEnd: () => {
      let finalScale = scale.value;
  
      if (finalScale < 1) {
        // Animate back to original state
        scale.value = withTiming(1, { duration: 200 });
        lastScale.value = 1;
  
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        lastTranslateX.value = 0;
        lastTranslateY.value = 0;
  
        runOnJS(setPanEnabledFromWorklet)(false);
      } else {
        // Clamp scale to a max of 3
        finalScale = Math.min(finalScale, 3);
        scale.value = withTiming(finalScale, { duration: 200 });
        lastScale.value = finalScale;
      }
    },
  });
  

  const contentWidth = width;
  const contentHeight = height;

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = lastTranslateX.value;
      ctx.startY = lastTranslateY.value;
    },
    onActive: (event, ctx) => {
      if (scale.value > 1) {
        const maxTranslateX = (contentWidth * scale.value - contentWidth) / 2;
        const maxTranslateY = (contentHeight * scale.value - contentHeight) / 2;

        let nextX = ctx.startX + event.translationX;
        let nextY = ctx.startY + event.translationY;

        nextX = Math.min(Math.max(nextX, -maxTranslateX), maxTranslateX);
        nextY = Math.min(Math.max(nextY, -maxTranslateY), maxTranslateY);

        translateX.value = nextX;
        translateY.value = nextY;
      }
    },
    onEnd: () => {
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={pinchRef}
        onGestureEvent={panHandler}
        enabled={panEnabled}  // use React state instead of reading scale.value
      >
        <Animated.View style={{ flex: 1 }}>
          <PinchGestureHandler
            ref={pinchRef}
            simultaneousHandlers={panRef}
            onGestureEvent={pinchHandler}
            minPointers={2}
          >
            <Animated.View style={{ flex: 1 }}>
              <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                {children}
              </Animated.View>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default ZoomWrapper;
