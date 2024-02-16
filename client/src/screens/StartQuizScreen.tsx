import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import ParticipationQuizCard from '@/components/cards/participationQuizCard';
import { useAppSelector } from '@/utils/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartQuizScreen() {
  const participationList = useAppSelector(
    (state) => state.participatingSlice.value
  );

  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  const renderItem = ({ item }: { item: Quiz }) => {
    return <ParticipationQuizCard quiz={item} />;
  };

  useEffect(() => {
    if (participationList) {
      const sorted = [...participationList];
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      );
      setSortedList(sorted);
    }
  }, [participationList]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.mainArea}>
          {sortedList.length ? (
            <FlashList
              data={sortedList}
              renderItem={renderItem}
              estimatedItemSize={108}
              ListFooterComponent={<View style={styles.listFooter}></View>}
            />
          ) : (
            <View style={styles.emptyList}>
              <Text>You're not signed up to any Quizzes</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerContainer: {
    flex: 1,
    width: '100%',
  },
  mainArea: {
    flex: 10,
    width: '100%',
  },
  listFooter: {
    height: 100,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});
