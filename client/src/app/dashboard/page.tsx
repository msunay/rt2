'use client'
import { getAllQuizzes, getOwner } from "@/redux/services/quizeApiService";
import { useEffect, useState } from "react";
import styles from './dashboard.module.css';
import moment from 'moment';
import { Quiz, User } from "@/Types";
import DashboardButton from "@/components/dashboard/dashboar-button";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [quize, setQuize] = useState<Quiz>();
  const [owner, setOwner] = useState<User>();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const quizes = await getAllQuizzes();
        const sortedByDate = quizes.sort((a: Quiz, b: Quiz) => moment(a.dateTime).diff(moment(b.dateTime)));
        if (sortedByDate.length) {
          const upcomingQuizz = sortedByDate[0];
          const responseUsers = await getOwner();
          const quizOwner = responseUsers.find(user => user.id === upcomingQuizz.quizOwner);
          setQuize(upcomingQuizz);
          setOwner(quizOwner);
        }
      } catch (error) {
        console.log('failed: ', error);
      }
    })();
  }, []);

  function kicksOffIn() {
    const msLeft = moment().diff(quize?.dateTime)
    const duration = moment.duration(msLeft)
    return duration.humanize();
  }

  return (
    <div className={styles.dashboard_container}>
      <div
        className={styles.quiz_contaniner}
        onClick={() => console.log('show the route to page')}
      >
        <h4>next quize</h4>
        <div className={styles.quiz_details}>
          <div>
            <p><strong>Name:</strong></p>
            <p><strong>Quize host:</strong></p>
            <p><strong>Quize category:</strong></p>
          </div>
          <div>
            <p>{quize?.quizName}</p>
            <p>{owner?.username}</p>
            <p>{quize?.category}</p>
          </div>
        </div>
        <span className={styles.divider}></span>
        <div className={styles.date_container}>
          <strong>starting in: </strong>
          <span>{kicksOffIn()} </span>
        </div>
      </div>

      <DashboardButton directTo='/participant' title='Participating in' />
      <DashboardButton directTo='/hosting' title='Hosting' />
      <DashboardButton directTo='/discovery' title='Discovery Quizzes' />
    </div>
  );
}