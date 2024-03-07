import { Quiz } from "@/types/Types";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, StyleSheet, View } from "react-native";
import DiscoverQuizCard from "../cards/discoverQuizCard";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";

interface Props {
  quizList: Quiz[];
  participations: Quiz[];
  search: (quizzes: Quiz[]) => Quiz[];
  isFetchingQuizzes: boolean;
  refetchQuizzes: () => QueryActionCreatorResult<
    QueryDefinition<
      void,
      BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        {},
        FetchBaseQueryMeta
      >,
      never,
      Quiz[],
      "backendApi"
    >
  >;
}

export default function DiscoverPublicList({
  quizList,
  participations,
  search,
  isFetchingQuizzes,
  refetchQuizzes,
}: Props) {
  // Function to render a quiz item.
  const renderItem = ({ item }: { item: Quiz }) => {
    return <DiscoverQuizCard quiz={item} participations={participations} />;
  };

  return (
    <FlashList
      data={search(quizList)}
      renderItem={renderItem}
      estimatedItemSize={108}
      refreshControl={
        <RefreshControl
          onRefresh={() => refetchQuizzes()}
          refreshing={isFetchingQuizzes}
        />
      }
      ListFooterComponent={<View style={styles.listFooter}></View>}
    />
  );
}

const styles = StyleSheet.create({
  listFooter: {
    height: 100,
  },
});
