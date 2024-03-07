import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  useGetAllQuizzesQuery,
  useGetUserParticipationsQuery,
} from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import DiscoverList from '@/components/lists/discoverPublicList';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { setParticipationsList } from '@/features/participatingSlice';
import DiscoverPublicList from '@/components/lists/discoverPublicList';
import DiscoverPrivateList from '@/components/lists/discoverPrivateList';

export default function DiscoverScreen() {
  // Select User Id
  const id = useAppSelector((state) => state.userIdSlice.id);
  // Select Participating store
  const participatingStore = useAppSelector(
    (state) => state.participatingSlice
  );
  // Dispach hook for RTK
  const dispatch = useAppDispatch();

  // Fetch all quizzes.
  const {
    data: quizzes,
    isFetching: isFetchingQuizzes,
    refetch: refetchQuizzes,
  } = useGetAllQuizzesQuery();
  // Fetch User Participations if participations array from store has not been set
  const { data: userParticipations } = useGetUserParticipationsQuery(id);

  // State for managing list of public quizzes.
  const [publicList, setPublicList] = useState<Quiz[]>([]);
  // State for managing list of private quizzes.
  const [privateList, setPrivateList] = useState<Quiz[]>([]);
  // State for managing the search query input by the user.
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Parameters to include in the search.
  const [searchParams] = useState(['quizName', 'category']);
  // Public toggle color
  const [publicBtnColor, setPublicBtnColor] = useState([
    { backgroundColor: '#25CED1' },
    styles.toggleBtnLeft,
  ]);
  // Private toggle color
  const [privateBtnColor, setPrivateBtnColor] = useState([
    { backgroundColor: '#FFFFFF' },
    styles.toggleBtnRight,
  ]);
  // State of the toggle btns
  const [privateToggle, setPrivateToggle] = useState(false);

  // If participatingSlice not initialized add participations to store
  useEffect(() => {
    if (!participatingStore.initialized) {
      if (userParticipations) {
        dispatch(setParticipationsList(userParticipations.quizzes));
      }
    }
  }, []);
  // Sort quizzes by their dateTime on fetch or when data changes.
  useEffect(() => {
    if (quizzes) {
      const sorted = [...quizzes]; // Create a copy to as quizzes is immutable.
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime() // Sort by ascending date and time.
      );
      setPublicList(sorted.filter((quiz) => quiz.isPrivate === false));
      setPrivateList(sorted.filter((quiz) => quiz.isPrivate));
    }
  }, [quizzes]);

  // Function to filter quizzes based on the search query.
  function search(quizzes: Quiz[]) {
    return quizzes.filter((elem) =>
      searchParams.some((param) => {
        // Check if any of the search parameters in a quiz includes the search query.
        return elem[param]
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    );
  }

  // If not already on public set list to public
  const togglePublic = () => {
    if (privateToggle) {
      setPublicBtnColor([{ backgroundColor: '#25CED1' }, styles.toggleBtnLeft]);
      setPrivateBtnColor([
        { backgroundColor: '#FFFFFF' },
        styles.toggleBtnRight,
      ]);
      setPrivateToggle(false);
    }
  };

  // If not already on private set list to private
  const togglePrivate = () => {
    if (!privateToggle) {
      setPublicBtnColor([{ backgroundColor: '#FFFFFF' }, styles.toggleBtnLeft]);
      setPrivateBtnColor([
        { backgroundColor: '#25CED1' },
        styles.toggleBtnRight,
      ]);
      setPrivateToggle(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <View style={styles.toggle}>
          <Pressable style={publicBtnColor} onPress={togglePublic}>
            <Text style={styles.btnText}>Public Quizzes</Text>
          </Pressable>
          <Pressable style={privateBtnColor} onPress={togglePrivate}>
            <Text style={styles.btnText}>Private Quizzes</Text>
          </Pressable>
        </View>
        <View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {privateToggle ? (
          <DiscoverPrivateList
            search={search}
            quizList={privateList}
            participations={participatingStore.value}
            refetchQuizzes={refetchQuizzes}
            isFetchingQuizzes={isFetchingQuizzes}
          />
        ) : (
          <DiscoverPublicList
            search={search}
            quizList={publicList}
            participations={participatingStore.value}
            refetchQuizzes={refetchQuizzes}
            isFetchingQuizzes={isFetchingQuizzes}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    // backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  toggleBtnRight: {
    flex: 1,
    justifyContent: 'center',
    // backgroundColor: '#FFFFFF',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Nunito-Bold',
  },
});
