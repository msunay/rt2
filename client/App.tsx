import { SafeAreaProvider } from 'react-native-safe-area-context';
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

import { store } from './src/store';
import Home from './src/screens/Home';
import Discover from './src/screens/Discover';

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
      <SafeAreaProvider>
        <NavigationContainer>
          <Tabs.Navigator
            initialRouteName="Home"
            tabBarOptions={tabBarOptions}
            appearance={appearanceOptions}
          >
            <Tabs.Screen
              name="Home"
              component={Home}
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
              component={Discover}
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
              component={Discover}
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
              component={Discover}
              options={{
                tabBarIcon: ({ size }: any) => (
                  <Octicons name="gear" size={size ? size : 24} color="black" />
                ),
              }}
            />
            <Tabs.Screen
              name="Profile"
              component={Discover}
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
      </SafeAreaProvider>
    </Provider>
  );
}
