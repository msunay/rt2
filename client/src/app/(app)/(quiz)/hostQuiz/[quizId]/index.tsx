import HostStream from "@/components/streaming/hostStream";
import { QUIZ_BACKGROUND } from "@/utils/images";
import { useLocalSearchParams } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";

export default function HostStreamPage() {
  // Get quizId from route slug.
  const { quizId } = useLocalSearchParams<{ quizId: string }>();

  return (
    <ImageBackground
      source={QUIZ_BACKGROUND.background}
      style={styles.background}
    >
      <HostStream quizId={quizId!} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-end",
    paddingBottom: 50,
  },
  camera: {
    flex: 1,
  },
});
