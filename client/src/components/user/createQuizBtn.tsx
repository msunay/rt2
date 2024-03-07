import { TILE_IMAGES } from "@/utils/images";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function CreateQuizBtn() {
  return (
    <Link href="/createQuiz" asChild>
      <Pressable style={styles.imageContainer}>
        <Image
          style={styles.image}
          contentFit="contain"
          source={TILE_IMAGES.createQuiz}
        />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  imageContainer: {
    height: 150,
    width: "60%",
  },
});
