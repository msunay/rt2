import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useSession } from '@/services/authctx';

export default function index() {
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      <Button
        title="Sign Out"
        onPress={() => {
          signOut();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
