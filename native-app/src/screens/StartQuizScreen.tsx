import { RefetchQuizzesContext } from '@/app/(app)/(tabs)/_layout';
import { useGetUserParticipationsQuery } from '@/src/api/backendApi';
import ParticipationQuizCard from '@/src/components/cards/participationQuizCard';
import { setParticipationsList } from '@/src/features/participatingSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks/reduxHooks';
import type { Quiz } from '@/src/types/Types';
import { sortQuizzes } from '@/src/utils/helpers';
import { FlashList } from '@shopify/flash-list';
import { useContext, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartQuizScreen() {
    const refetchAllQuizzes = useContext(RefetchQuizzesContext);
    const { isFetchingQuizzes } = useAppSelector((store) => store.quizzesSlice);

    // Typed Hook to dispatch actions to Redux store.
    const dispatch = useAppDispatch();
    // Select User ID
    const id = useAppSelector((state) => state.userIdSlice.id);
    // Select participations array from store
    const participatingStore = useAppSelector((state) => state.participatingSlice);

    // Fetch User Participations if participations array from store has not been set
    const { data: userParticipations } = useGetUserParticipationsQuery(id);

    // State to hold the sorted list of participation quizzes.
    const [sortedList, setSortedList] = useState<Quiz[]>([]);

    // Fetch User Participations if participations array from store has not been set
    useEffect(() => {
        if (!participatingStore.initialized) {
            if (userParticipations) {
                dispatch(setParticipationsList(userParticipations.quizzes));
            }
        }
    }, [participatingStore, dispatch, userParticipations]);

    // Effect hook to sort the participation quizzes by their dateTime in ascending order once the participationList updates.
    useEffect(() => {
        // Update the sortedList state with the sorted quizzes.
        setSortedList(sortQuizzes([...participatingStore.value]));
    }, [participatingStore.value]);

    // Function to render a quiz item.
    const renderItem = ({ item }: { item: Quiz }) => {
        return <ParticipationQuizCard quiz={item} />;
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <View style={styles.container}>
                <View style={styles.mainArea}>
                    {sortedList.length ? (
                        <FlashList
                            data={sortedList}
                            renderItem={renderItem}
                            estimatedItemSize={108}
                            ListFooterComponent={<View style={styles.listFooter} />}
                            refreshControl={
                                <RefreshControl
                                    onRefresh={() => refetchAllQuizzes?.()}
                                    refreshing={isFetchingQuizzes}
                                />
                            }
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
    },
});
