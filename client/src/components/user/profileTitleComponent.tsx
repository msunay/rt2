import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { PROFILE_PLACEHOLDER } from '@/utils/images';
import { useAppSelector } from '@/hooks/reduxHooks';

export default function ProfileTitleComponent() {
  const userDetails = useAppSelector(state => state.userSlice);

  return (
    <View style={styles.namePictureContainer}>
      <View style={styles.profileImageContainer}>
        <Image
          source={PROFILE_PLACEHOLDER.icon}
          style={styles.profileImage}
          contentFit='cover'
        />
      </View>
      <Text style={styles.name}>Jimmy Nuetron</Text>
      <Text style={styles.nameSubText}>{`Points - ${userDetails.pointsWon}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  namePictureContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // borderColor: '#FF0000',
    // borderWidth: 1
  },
  profileImageContainer: {
    // flex: 1,
    marginBottom: 20,
    width: 100,
    height: 100,
    shadowColor: '#FF7F50',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    // backgroundColor: "#000000",
    // borderColor: '#FF0000',
    // borderWidth: 1
  },
  profileImage: {
    flex: 1,
    borderRadius: 50,
    borderColor: '#FF7F50',
    borderWidth: 0.4,
  },
  name: {
    fontFamily: 'Nunito-Bold',
    fontSize: 25,
  },
  nameSubText: {
    fontFamily: 'Nunito-Regular',
  },
});
