const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }) => ({
  ...config,
  name: IS_DEV ? 'rt2 (Dev)' : 'rt2',
  slug: 'rt2-native-app',
  ios: {
    bundleIdentifier: IS_DEV ? 'com.msunay.rt2.nativeapp.dev' : 'com.msunay.rt2.nativeapp',
  },
  android: {
    package: IS_DEV ? 'com.msunay.rt2.nativeapp.dev' : 'com.msunay.rt2.nativeapp',
  },
});
