import Image from "next/image";
import arrowImage from '@/public/swg-arrow.svg'
import { useRouter } from "next/navigation";
import styles from '@/app/dashboard/dashboard.module.css'

interface PageProps {
  directTo: string
  title: string
}

export default function DashboardButton({ title, directTo }: PageProps) {
  const router = useRouter();

  return (
    <button onClick={() => router.push(`dashboard/${directTo}`)}>
      {title}
      <Image
        src={arrowImage}
        alt="arrow next page"
        width={45}
        height={45}
        className={styles.arrow_next}
      />
    </button>
  )
}