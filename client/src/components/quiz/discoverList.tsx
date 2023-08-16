import { useAppSelector } from "@/redux/hooks";
import { Quiz } from "@/Types";
import QuizCard from "./quizCard";

export default function DiscoverList() {
  const quizList = useAppSelector((state) => state.discoverSlice.value)

  return (
    <div className="">
      { quizList.map((quizItem:Quiz) => 
      <div key={quizItem.id}>
        <QuizCard quiz={quizItem}/>
      </div>
      )}
    </div>
  )
}