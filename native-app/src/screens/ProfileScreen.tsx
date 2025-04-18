import ProfileInfoComponent from '@/components/user/profileInfoComponent';
import ProfileTitleComponent from '@/components/user/profileTitleComponent';
import { StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <ProfileTitleComponent />
        <ProfileInfoComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mainArea: {
    flex: 10,
    width: '100%',
    alignItems: 'center',
    // justifyContent: 'center',
  },
});
