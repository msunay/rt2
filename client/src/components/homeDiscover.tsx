import { StyleSheet, Text, View } from 'react-native'
import { useFonts, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useGetAllQuizzesQuery } from '../services/apiService';
import { Quiz } from '../types/Types';
import { useEffect } from 'react';

export default function HomeDiscover() {

  const { data, error, isLoading } = useGetAllQuizzesQuery();

  let [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }


  // if (error) {
  //   console.error('Error fetching data:', error);
  //   // return <Text>{`Oh no, there was an error: ${error}`}</Text>;
  // }


  return (
    <View>
      <View style={styles.discoverTitleLine}>
        <Text style={styles.h1}>Discover</Text>
        <View>
          <Text style={styles.h2}>View All  {'->'}</Text>
        </View>
      </View>
      <View>
        {error ? (
          <Text>Oh no, there was an error</Text>
        ) : isLoading ? (
          <Text>Loading...</Text>
        ) : data ? (
          data.map((quiz: Quiz) => (
            <View key={quiz.id}>
              {/* Render your Quiz information here */}
              <Text>{quiz.quizName}</Text>
              <Text>{quiz.host_name}</Text>
              {/* Add other Quiz properties as needed */}
            </View>
          ))
        ) : null}


      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  discoverTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#FF0000',
    borderWidth: 1,
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