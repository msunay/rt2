import styles from '@/styles/spinner.module.css';

export default function Loading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
    </div>
  )
}