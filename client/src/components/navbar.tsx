import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Feather, AntDesign, Entypo,  } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function Navbar() {
  return (
    <View style={styles.container}>
      <Link href='/'>
        <Feather name="home" size={24} color="black" />
      </Link>
      <AntDesign name="find" size={24} color="black" />
      <Entypo name="graduation-cap" size={24} color="black" />
      <Entypo name="tools" size={24} color="black" />
      <AntDesign name="user" size={24} color="black" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // alignSelf: 'flex-end',
    justifyContent: 'space-around',
    width: "85%",
    height: 60,
    borderColor: '#FF0000',
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#454545',
    shadowOffset: {
      width: 4,
      height: 4
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    position: 'absolute',
    bottom: 10
  },
})