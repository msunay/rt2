// import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
// import { useColorScheme } from 'react-native';
import {
  AnimatedTabBarNavigator,
  DotSize, // optional
  TabElementDisplayOptions, // optional
  TabButtonLayout, // optional
  IAppearanceOptions, // optional
} from 'react-native-animated-nav-tab-bar';
import Home from '.';
import Quiz from './quiz';
import Discover from './discover';
import { Feather, AntDesign, Entypo } from '@expo/vector-icons';
import Host from './host';
import Profile from './profile';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: '(tabs)',
// };

// export default function RootLayout() {
//   const [loaded, error] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//     ...FontAwesome.font,
//   });

// Expo Router uses Error Boundaries to catch errors in the navigation tree.
// useEffect(() => {
//   if (error) throw error;
// }, [error]);

//   return (
//     <>
//       {/* Keep the splash screen open until the assets have loaded. In the future, we should just support async font loading with a native version of font-display. */}
//       {!loaded && <SplashScreen />}
//       {loaded && <RootLayoutNav />}
//     </>
//   );
// }
const Tabs = AnimatedTabBarNavigator();

function RootLayoutNav() {
  // const colorScheme = useColorScheme();

  return (
    <>
      {/* Add your react-query provider */}
      {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
      <Tabs.Navigator
        // default configuration from React Navigation
        tabBarOptions={{
          activeTintColor: '#2F7C6E',
          inactiveTintColor: '#222222',
        }}
        appearance={{
          floating: true,
        }}
      >
        <Tabs.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ focused, color, size }: any) => (
              <Feather
                name="home"
                size={size ? size : 24}
                color={focused ? color : '#222222'}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Discover"
          component={Discover}
          options={{
            tabBarIcon: ({ focused, color, size }: any) => (
              <AntDesign
                name="find"
                size={size ? size : 24}
                color={focused ? color : '#222222'}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Quiz"
          component={Quiz}
          options={{
            tabBarIcon: ({ focused, color, size }: any) => (
              <Entypo
                name="graduation-cap"
                size={size ? size : 24}
                color={focused ? color : '#222222'}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Host"
          component={Host}
          options={{
            tabBarIcon: ({ focused, color, size }: any) => (
              <Entypo
                name="tools"
                size={size ? size : 24}
                color={focused ? color : '#222222'}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarIcon: ({ focused, color, size }: any) => (
              <AntDesign
                name="user"
                size={size ? size : 24}
                color={focused ? color : '#222222'}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs.Navigator>
      {/* </ThemeProvider> */}
    </>
  );
}
