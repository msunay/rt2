import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DiscoverPrivateList from '@/components/lists/discoverPrivateList';
import { useGetUserParticipationsQuery } from '@/services/backendApi';
import type { Quiz } from '@/types/Types';
import { useContext, useEffect, useReducer } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setParticipationsList } from '@/features/participatingSlice';
import DiscoverPublicList from '@/components/lists/discoverPublicList';
import { RefetchQuizzesContext } from '@/app/(app)/(tabs)/_layout';
import {
  defaultDiscoverScreenState,
  discoverScreenStateReducer,
} from '@/reducers/discoverScreenStateReducer';

export default function DiscoverScreen() {
  // Dispach typed hook for RTK
  const dispatch = useAppDispatch();

  const refetchAllQuizzes = useContext(RefetchQuizzesContext);
  // Select User Id
  const id = useAppSelector(state => state.userIdSlice.id);
  // Select Participating store
  const participatingStore = useAppSelector(state => state.participatingSlice);
  // Fetch all quizzes.
  const { privateQuizzes, publicQuizzes, isFetchingQuizzes } = useAppSelector(
    state => state.quizzesSlice,
  );
  // Fetch User Participations if participations array from store has not been set
  const { data: userParticipations } = useGetUserParticipationsQuery(id);

  const [state, dispatchState] = useReducer(
    discoverScreenStateReducer,
    defaultDiscoverScreenState,
  );

  useEffect(() => {
    dispatchState({
      type: 'SET_DS_PUBLIC_BTN_COLOR',
      payload: [{ backgroundColor: '#25CED1' }, styles.toggleBtnLeft],
    });
    dispatchState({
      type: 'SET_DS_PRIVATE_BTN_COLOR',
      payload: [{ backgroundColor: '#FFFFFF' }, styles.toggleBtnRight],
    });
  }, []);

  // If participatingSlice not initialized add participations to store
  useEffect(() => {
    if (!participatingStore.initialized) {
      if (userParticipations) {
        dispatch(setParticipationsList(userParticipations.quizzes));
      }
    }
  }, [participatingStore, userParticipations, dispatch]);

  // Function to filter quizzes based on the search query.
  function search(quizzes: Quiz[]) {
    return quizzes.filter(elem =>
      state.searchParams.some(param => {
        // Check if any of the search parameters in a quiz includes the search query.
        return elem[param]
          ?.toString()
          .toLowerCase()
          .includes(state.searchQuery.toLowerCase());
      }),
    );
  }

  // If not already on public set list to public
  const togglePublic = () => {
    if (state.privateToggle) {
      dispatchState({
        type: 'SET_DS_PUBLIC_BTN_COLOR',
        payload: [{ backgroundColor: '#25CED1' }, styles.toggleBtnLeft],
      });
      dispatchState({
        type: 'SET_DS_PRIVATE_BTN_COLOR',
        payload: [{ backgroundColor: '#FFFFFF' }, styles.toggleBtnRight],
      });
      dispatchState({ type: 'SET_DS_PRIVATE_TOGGLE', payload: false });
    }
  };

  // If not already on private set list to private
  const togglePrivate = () => {
    if (!state.privateToggle) {
      dispatchState({
        type: 'SET_DS_PUBLIC_BTN_COLOR',
        payload: [{ backgroundColor: '#FFFFFF' }, styles.toggleBtnLeft],
      });
      dispatchState({
        type: 'SET_DS_PRIVATE_BTN_COLOR',
        payload: [{ backgroundColor: '#25CED1' }, styles.toggleBtnRight],
      });
      dispatchState({ type: 'SET_DS_PRIVATE_TOGGLE', payload: true });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <View style={styles.toggle}>
          <Pressable style={state.publicBtnColor} onPress={togglePublic}>
            <Text style={styles.btnText}>Public Quizzes</Text>
          </Pressable>
          <Pressable style={state.privateBtnColor} onPress={togglePrivate}>
            <Text style={styles.btnText}>Private Quizzes</Text>
          </Pressable>
        </View>
        <View>
          <TextInput
            style={styles.searchBar}
            placeholder='Search'
            value={state.searchQuery}
            onChangeText={text =>
              dispatchState({ type: 'SET_DS_SEARCH_QUERY', payload: text })
            }
          />
        </View>
        {state.privateToggle
          ? refetchAllQuizzes && (
              <DiscoverPrivateList
                search={search}
                quizList={privateQuizzes}
                participations={participatingStore.value}
                isFetchingQuizzes={isFetchingQuizzes}
              />
            )
          : refetchAllQuizzes && (
              <DiscoverPublicList
                search={search}
                quizList={publicQuizzes}
                participations={participatingStore.value}
                isFetchingQuizzes={isFetchingQuizzes}
              />
            )}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
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
  searchBar: {
    height: 50,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 10,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
  },
  toggle: {
    height: 70,
    marginBottom: 10,
    flexDirection: 'row',
  },
  toggleBtnLeft: {
    flex: 1,
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  toggleBtnRight: {
    flex: 1,
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Nunito-Bold',
  },
});
