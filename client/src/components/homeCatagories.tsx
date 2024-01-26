import { StyleSheet, Text, View } from 'react-native'
import { useFonts, Nunito_700Bold } from '@expo-google-fonts/nunito';


export default function HomeCatagories() {

  let [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.catagoriesTitleLine}>
      <Text style={styles.h1}>Catagories</Text>
      <View>
        <Text style={styles.h2}>View All  {'->'}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  catagoriesTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  h1: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16
  },
  h2: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  }
})