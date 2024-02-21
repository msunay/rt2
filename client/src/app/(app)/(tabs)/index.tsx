import {
  AnimatedTabBarNavigator,
  DotSize,
  TabElementDisplayOptions,
} from 'react-native-animated-nav-tab-bar';
import {
  AntDesign,
  Entypo,
  MaterialIcons,
  Octicons,
  FontAwesome5,
} from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import DiscoverScreen from '@/screens/DiscoverScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HostingScreen from '@/screens/HostingScreen';
import StartQuizScreen from '@/screens/StartQuizScreen';

export default function TabScreen() {
  const Tabs = AnimatedTabBarNavigator(); // Use Tab component from react-native-animated-nav-tab-bar

  const tabBarOptions = {
    activeBackgroundColor: '#25CED1',
    labelStyle: {
      fontSize: 12,
      fontWeight: 700,
    },
    tabStyle: {
      borderRadius: 15,
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
            <AntDesign name="home" size={size ? size : 24} color="black" />
          ),
          unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <Entypo name="compass" size={size ? size : 24} color="black" />
          ),
          unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Start Quiz"
        component={StartQuizScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <MaterialIcons name="quiz" size={size ? size : 24} color="black" />
          ),
          unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Host Quiz"
        component={HostingScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <Octicons name="gear" size={size ? size : 24} color="black" />
          ),
          unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ size }: any) => (
            <FontAwesome5 name="user" size={size ? size : 24} color="black" />
          ),
          unmountOnBlur: true,
        }}
      />
    </Tabs.Navigator>
  );
}
