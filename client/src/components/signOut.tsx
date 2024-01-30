import { Button, Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { useSession } from '@/services/authctx';
import { FontAwesome } from '@expo/vector-icons';

export default function SignOut() {
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => {
          signOut();
        }}>
          <FontAwesome name="sign-out" size={24} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    right: 5
  },
});
