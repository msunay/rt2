import { NavigationContainer } from '@react-navigation/native';
import {
  AnimatedTabBarNavigator,
  DotSize,
  TabElementDisplayOptions,
} from 'react-native-animated-nav-tab-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import {
  AntDesign,
  Entypo,
  MaterialIcons,
  Octicons,
  FontAwesome5,
} from '@expo/vector-icons';

import { store } from '@/store';
import HomeScreen from '@/screens/HomeScreen';
import DiscoverScreen from '@/screens/DiscoverScreen';
import HostQuizScreen from '@/screens/HostQuizScreen';
import LoginScreen from '@/app/login';

// SplashScreen.preventAutoHideAsync();

const Tabs = AnimatedTabBarNavigator();

const tabBarOptions = {
  activeBackgroundColor: '#25CED1',
  labelStyle: {
    fontSize: 12,
    fontWeight: 700,
  },
  tabStyle: {
    borderRadius: 15
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
    <Provider store={store}>
        <NavigationContainer>
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
            <Tabs.Screen
              name="Login"
              component={LoginScreen}
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
        </NavigationContainer>
    </Provider>
  );
}
