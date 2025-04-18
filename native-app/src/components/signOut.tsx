import { store } from '@/src/store';
import { useSession } from '@/src/context/authContext';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

export default function SignOut() {
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          if (signOut) {
            signOut();
            store.dispatch({ type: 'logout' });
          }
        }}
      >
        <FontAwesome name='sign-out' size={24} color='black' />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    right: 5,
  },
});
