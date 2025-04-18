import {
  AntDesign,
  Entypo,
  FontAwesome5,
  MaterialIcons,
  Octicons,
} from '@expo/vector-icons';
import {
  AnimatedTabBarNavigator,
  DotSize,
  TabElementDisplayOptions,
} from 'react-native-animated-nav-tab-bar';

import { useAppSelector } from '@/src/hooks/reduxHooks';
import DiscoverScreen from '@/src/screens/DiscoverScreen';
import HomeScreen from '@/src/screens/HomeScreen';
import HostingScreen from '@/src/screens/HostingScreen';
import ProfileScreen from '@/src/screens/ProfileScreen';
import StartQuizScreen from '@/src/screens/StartQuizScreen';
import { useEffect } from 'react';

export default function TabScreen() {
  const Tabs = AnimatedTabBarNavigator(); // Use Tab component from react-native-animated-nav-tab-bar

  // const id = useAppSelector(state => state.userIdSlice.id);


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
      initialRouteName='Home'
      tabBarOptions={tabBarOptions}
      appearance={appearanceOptions}
    >
      <Tabs.Screen
        name='Home'
        component={HomeScreen}
        options={{
          tabBarIcon: ({ size }: { size: number }) => (
            <AntDesign name='home' size={size ? size : 24} color='black' />
          ),
          // unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name='Discover'
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ size }: { size: number }) => (
            <Entypo name='compass' size={size ? size : 24} color='black' />
          ),
          // unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name='Start Quiz'
        component={StartQuizScreen}
        options={{
          tabBarIcon: ({ size }: { size: number }) => (
            <MaterialIcons name='quiz' size={size ? size : 24} color='black' />
          ),
          // unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name='Host Quiz'
        component={HostingScreen}
        options={{
          tabBarIcon: ({ size }: { size: number }) => (
            <Octicons name='gear' size={size ? size : 24} color='black' />
          ),
          // unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ size }: { size: number }) => (
            <FontAwesome5 name='user' size={size ? size : 24} color='black' />
          ),
          // unmountOnBlur: true,
        }}
      />
    </Tabs.Navigator>
  );
}
