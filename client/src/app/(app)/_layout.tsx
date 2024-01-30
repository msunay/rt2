import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/services/authctx';
import { Text } from 'react-native';
import {
  AnimatedTabBarNavigator,
  DotSize,
  TabElementDisplayOptions,
} from 'react-native-animated-nav-tab-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  AntDesign,
  Entypo,
  MaterialIcons,
  Octicons,
  FontAwesome5,
} from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import DiscoverScreen from '@/screens/DiscoverScreen';
import HostQuizScreen from '@/screens/HostQuizScreen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

const Tabs = AnimatedTabBarNavigator();

const tabBarOptions = {
  activeBackgroundColor: '#25CED1',
  labelStyle: {
    fontSize: 12,
    fontWeight: 700,
  },
  tabStyle: {
    borderRadius: 15,
    // bottom: -50 //BUG
  },
};

const appearanceOptions = {
  floating: true,
  whenActiveShow: TabElementDisplayOptions.BOTH,
  whenInactiveShow: TabElementDisplayOptions.ICON_ONLY,
  dotCornerRadius: 15,
  dotSize: DotSize.LARGE,
  shadow: true,
};

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const [fontsLoaded] = useFonts({
    'Nunito-Black': require('../../../assets/fonts/Nunito-Black.ttf'),
    'Nunito-Regular': require('../../../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-ExtraLight': require('../../../assets/fonts/Nunito-ExtraLight.ttf'),
    'Nunito-Light': require('../../../assets/fonts/Nunito-Light.ttf'),
    'Nunito-Medium': require('../../../assets/fonts/Nunito-Medium.ttf'),
    'Nunito-SemiBold': require('../../../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../../../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../../../assets/fonts/Nunito-ExtraBold.ttf'),
  });

  useEffect(() => {
    (async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    })();
  }, [fontsLoaded]);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  // return <Stack screenOptions={{headerShown: false}} />;
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBarOptions={tabBarOptions}
      appearance={appearanceOptions}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <AntDesign
              name="home"
              size={size ? size : 24}
              color="black"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <Entypo
              name="compass"
              size={size ? size : 24}
              color="black"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Start Quiz"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <MaterialIcons
              name="quiz"
              size={size ? size : 24}
              color="black"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Host Quiz"
        component={HostQuizScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <Octicons name="gear" size={size ? size : 24} color="black" />
          ),
          unmountOnBlur: true
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <FontAwesome5
              name="user"
              size={size ? size : 24}
              color="black"
            />
          ),
        }}
      />
    </Tabs.Navigator>
  )
}
