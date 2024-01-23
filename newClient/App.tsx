import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AnimatedTabBarNavigator } from 'react-native-animated-nav-tab-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';

import { store } from './src/store';
import Home from './src/screens/Home';
import Discover from './src/screens/Discover';

// SplashScreen.preventAutoHideAsync();

const Tabs = AnimatedTabBarNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tabs.Navigator
            appearance={{
              floating: true,
              whenInactiveShow: 'both',
            }}
          >
            <Tabs.Screen name="Home" component={Home} />
            <Tabs.Screen name="Discover" component={Discover} />
          </Tabs.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
