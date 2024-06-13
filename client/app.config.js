const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: IS_DEV ? "RT2 (dev)" : "RT2",
    slug: "rt2",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#07102c"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    scheme: "rt2",
    ios: {
      supportsTablet: false,
      bundleIdentifier: IS_DEV ? "com.msunay.rt2.dev" : "com.msunay.rt2",
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        android.permission.CAMERA,
        android.permission.RECORD_AUDIO,
        android.permission.MODIFY_AUDIO_SETTINGS
      ],
      package: IS_DEV ? "com.msunay.rt2.dev" : "com.msunay.rt2"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "@config-plugins/react-native-webrtc",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone"
        }
      ],
      [
        expo-font,
        {
          fonts: [
            "./assets/fonts/Nunito-Black.ttf",
            "./assets/fonts/Nunito-Regular.ttf",
            "./assets/fonts/Nunito-Light.ttf",
            "./assets/fonts/Nunito-ExtraLight.ttf",
            "./assets/fonts/Nunito-Medium.ttf",
            "./assets/fonts/Nunito-SemiBold.ttf",
            "./assets/fonts/Nunito-Bold.ttf",
            "./assets/fonts/Nunito-ExtraBold.ttf"
          ]
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ],
      "expo-router",
      [
        "expo-secure-store",
        {
          "faceIDPermission": "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ],
    extra: {
      router: {
        "origin": false
      },
      eas: {
        projectId: "c1ac51d9-87e4-427e-a2ab-01244251a217"
      }
    },
    owner: "msunay"
  }
}
