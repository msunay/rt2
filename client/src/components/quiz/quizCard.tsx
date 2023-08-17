import { Quiz } from "@/Types";
import moment from "moment";
import Image from 'next/image'
import plus from '@/public/plus-square.svg'
import tick from '@/public/check.gif'
import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { userApiService } from "@/redux/services/apiService";

export default function QuizCard({quiz}:{quiz:Quiz}) {

  const [isSignedUp, setIsSignedUp] = useState(false);
  
  const authToken = useAppSelector((state) => state.authSlice.authToken);
  const router = useRouter(); 

  function handleClick() {
    setIsSignedUp(true);
    userApiService.addParticipation(quiz.id!, authToken);
  }

  return (
    <>
      <div className="quiz-card-container">
        <div className="quiz-info">
          <h2>{quiz.quizName}</h2>
          <h4>{quiz.category}</h4>
          <h4>{moment(quiz.dateTime).format('dddd D MMM H:mm')}</h4>
        </div>
        <div className="add-or-remove">
          {isSignedUp === true ? (
              <Image className="tick-icon" src={tick} alt="tick sign" />
            ) : (
            <button className="btn" onClick={handleClick}>
              <Image className="plus-icon" src={plus} alt="plus sign" />
            </button>
          )
        }
        </div>
      </div>
    </>
  )
}