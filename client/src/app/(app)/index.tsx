// import { NavigationContainer } from 'expo-router';
import {
  AnimatedTabBarNavigator,
  DotSize,
  TabElementDisplayOptions,
} from 'react-native-animated-nav-tab-bar';
import * as SplashScreen from 'expo-splash-screen';
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
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// SplashScreen.preventAutoHideAsync();

const Tabs = AnimatedTabBarNavigator();

const tabBarOptions = {
  activeBackgroundColor: '#25CED1',
  labelStyle: {
    fontSize: 12,
    fontWeight: 700,
  },
  tabStyle: {
    borderRadius: 15,
    bottom: -50 //BUG
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

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  }
})