import { Stack } from 'expo-router';
import { SessionProvider } from '@/utils/authctx';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Prevents the splash screen from hiding automatically.
SplashScreen.preventAutoHideAsync();

// Defines the root component of the application.
export default function Root() {
  // Loads custom fonts asynchronously and tracks their loading state.
  const [fontsLoaded, fontError] = useFonts({
    // Object mapping font names to their respective font file imports.
    // This allows for the use of custom fonts throughout the app.
    'Nunito-Black': require('../../assets/fonts/Nunito-Black.ttf'),
    'Nunito-Regular': require('../../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-ExtraLight': require('../../assets/fonts/Nunito-ExtraLight.ttf'),
    'Nunito-Light': require('../../assets/fonts/Nunito-Light.ttf'),
    'Nunito-Medium': require('../../assets/fonts/Nunito-Medium.ttf'),
    'Nunito-SemiBold': require('../../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../../assets/fonts/Nunito-ExtraBold.ttf'),
  });

  useEffect(() => {
    (async () => {
      // If fonts are loaded or there's an error loading them, hide the splash screen.
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    })();
  }, [fontsLoaded, fontError]);

  // Conditional rendering based on font loading state.
  // If fonts are not loaded and there's no font loading error, render nothing (null).
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Renders the application's UI structure wrapped in providers for Redux store and session context.
  // This setup enables global state management via Redux and session handling throughout the app.
  return (
    <Provider store={store}>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </Provider>
  );
}
