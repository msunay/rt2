import '../styles/globals.css';
import { Providers } from "@/redux/provider";
import styles from '../styles/auth.module.css';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.auth_container}>
      <h2>REAL TIME TRIVIA</h2>
      <Providers>{children}</Providers>
    </div>
  );
}