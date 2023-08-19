import '../globals.css';
import { Providers } from '@/redux/provider';
import styles from '@/app/auth/styles/auth.module.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.auth_container}>
      <nav>Real Time Trivia</nav>
      <Providers>{children}</Providers>
    </div>
  );
}
