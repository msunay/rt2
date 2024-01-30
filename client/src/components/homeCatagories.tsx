import { StyleSheet, Text, View } from 'react-native'

export default function HomeCatagories() {
  return (
    <View style={styles.catagoriesTitleLine}>
      <Text style={styles.h1}>Top Catagories</Text>
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
    fontFamily: 'Nunito-Bold',
    fontSize: 18
  },
  h2: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#FF7F50',
  }
})