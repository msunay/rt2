import { RefetchQuizzesContext } from '@/app/(app)/(tabs)/_layout';
import type { Quiz } from '@/types/Types';
import { FlashList } from '@shopify/flash-list';
import { useContext } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import DiscoverQuizCard from '../cards/discoverQuizCard';

interface Props {
  quizList: Quiz[];
  participations: Quiz[];
  search: (quizzes: Quiz[]) => Quiz[];
  isFetchingQuizzes: boolean;
}

export default function DiscoverPublicList({
  quizList,
  participations,
  search,
  isFetchingQuizzes,
}: Props) {
  const refetchAllQuizzes = useContext(RefetchQuizzesContext);

  // Function to render a quiz item.
  const renderItem = ({ item }: { item: Quiz }) => {
    return <DiscoverQuizCard quiz={item} participations={participations} />;
  };

  return (
    refetchAllQuizzes && (
      <FlashList
        data={search(quizList)}
        renderItem={renderItem}
        estimatedItemSize={108}
        refreshControl={
          <RefreshControl
            onRefresh={() => refetchAllQuizzes()}
            refreshing={isFetchingQuizzes}
          />
        }
        ListFooterComponent={<View style={styles.listFooter} />}
      />
    )
  );
}

const styles = StyleSheet.create({
  listFooter: {
    height: 100,
  },
});
