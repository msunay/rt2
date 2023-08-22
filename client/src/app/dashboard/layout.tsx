'use client'
import '../globals.css';
import { Providers } from '@/redux/provider';
import styles from '@/app/auth-styles/auth.module.css';
import { useRouter } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className={styles.auth_container}>
      <nav onClick={() => router.push('/dashboard')}>Real Time Trivia</nav>
      <Providers>{children}</Providers>
    </div>
  );
}
