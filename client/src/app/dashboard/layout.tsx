'use client'
import '../globals.css';
import { Providers } from '@/redux/provider';
import styles from '@/styles/auth.module.css';
import { useRouter } from 'next/navigation';
import exit_icon from '@/public/icons-exit.png';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setAuthState } from '@/redux/features/authSlice';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  
  function exitUser () {
    router.push('/')
    localStorage.clear();
    dispatch(setAuthState(''));
  }

  return (
    <div className={styles.auth_container}>
      <nav 
      onClick={() => router.push('/dashboard')}
      >
        <p> Real Time Trivia</p>
        <Image
          className='exit-icon'
          src={exit_icon}
          width={35}
          height={30}
          alt='exit image'
          onClick={() => exitUser()}
        />
        </nav>
      <Providers>{children}</Providers>
    </div>
  );
}
