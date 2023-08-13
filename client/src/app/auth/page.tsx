'use client'
import styles from '../../styles/auth.module.css';
import Image from 'next/image';
import google from '../../public/google_icon.svg';
import facebook from '../../public/facebook.svg';
import Login from '@/components/login';
import SignUp from '@/components/sign-up';
import { useState } from 'react';



export default function Page() {

  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);

  return (
    <div className={styles.routing_container}>
      <div
        className={styles.login_container}
        style={{ visibility: loginVisible ? 'visible' : 'hidden' }}>
        {<Login />}
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
        <span>forgot your password?</span>
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

  )
}