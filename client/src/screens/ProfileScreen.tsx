import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { PROFILE_PLACEHOLDER } from "@/utils/images";

export default function ProfileScreen() {
  const topFormItemStyles = {};
  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <View style={styles.namePictureContainer}>
          <View style={styles.profileImageContainer}>
            <Image
              source={PROFILE_PLACEHOLDER.icon}
              style={styles.profileImage}
              contentFit="cover"
            />
          </View>
          <Text style={styles.name}>Josef Blogs</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.titleContainer}>
            <Text style={styles.personalInfoTitle}>Personal Information</Text>
          </View>
          <View style={styles.formContainer}>
            <View
              style={[
                { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
                styles.formItem,
              ]}
            ></View>
            <View style={styles.formItem}></View>
            <View style={styles.formItem}></View>
            <View style={[
                { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
                styles.formItem,
              ]}></View>
          </View>
          <View style={styles.listFooter}></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  mainArea: {
    flex: 10,
    width: "100%",
    alignItems: "center",
    // justifyContent: 'center',
  },
  namePictureContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // borderColor: '#FF0000',
    // borderWidth: 1
  },
  profileImageContainer: {
    // flex: 1,
    marginBottom: 20,
    width: 100,
    height: 100,
    shadowColor: "#FF7F50",
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
    borderColor: "#FF7F50",
    borderWidth: 0.4,
  },
  details: {
    flex: 2,
    width: "100%",
  },
  name: {
    fontFamily: "Nunito-Bold",
    fontSize: 25,
  },
  titleContainer: {
    flexDirection: "row",
    height: 30,
    // borderColor: "#FF0000",
    // borderWidth: 1,
  },
  personalInfoTitle: {
    fontFamily: "Nunito-SemiBold",
  },
  formContainer: {
    flex: 1,
    // borderColor: "#FF0000",
    // borderWidth: 1,
  },
  formItem: {
    backgroundColor: "#FFFFFF",
    height: 50,
    marginBottom: 3,
  },
  listFooter: {
    height: 100,
  },
});
