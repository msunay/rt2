import { Pressable, StyleSheet, View } from 'react-native';
import { useSession } from '@/utils/authctx';
import { FontAwesome } from '@expo/vector-icons';
import { store } from '@/store';

export default function SignOut() {
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          signOut();
          store.dispatch({ type: 'logout' });
        }}
      >
        <FontAwesome name="sign-out" size={24} color="black" />
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
