'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState} from 'react';
import { RootState } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';
import Image from 'next/image';
import google from '@/public/google_icon.svg';
import facebook from '@/public/facebook.svg';
import Login from '@/components/auth/login';
import SignUp from '@/components/auth/sign-up';
import styles from '@/styles/auth.module.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export default function Page() {

  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);
  const router = useRouter();
  const authToken = useAppSelector(
    (state: RootState) => state.authSlice.authToken
  );

  useEffect(() => {
    if (authToken) router.push('/dashboard');
  }, []);


  return (
    <div className={styles.auth_container}>
    <div className={styles.routing_container}>
      <div
        className={styles.login_container}
        style={{ visibility: loginVisible ? 'visible' : 'hidden' }}
      >
        {
          <Login
            setSignupVisible={setSignupVisible}
            setLoginVisible={setLoginVisible}
          />
        }
      </div>
      <div
        className={styles.signup_container}
        style={{ visibility: signupVisible ? 'visible' : 'hidden' }}>
        {<SignUp />}
      </div>
      <div className={styles.local_signup_container}>
        <button
          className={styles.btn_login}
          onClick={() => setLoginVisible(true)}
        >
          LOGIN
        </button>
        <button
          className={styles.btn_signup}
          onClick={() => setSignupVisible(true)}>
          Create new account
        </button>
      </div>

      <div className={styles.oauth_container}>
        <Image
          src={google}
          alt='google-icon'
        />
        <Image
          src={facebook}
          alt='facebook-icon'
        />
      </div>
    </div>
    </div>
  )
}
