"use client";
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import Dashboard from "./dashboard/page";


export default function Home() {
  const authToken = useAppSelector((state: RootState) => state.authSlice.authToken)
  const router = useRouter();

  useEffect(() => {
    axios.get('http://localhost:3001/', { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => {
        if (res.status !== 200) {
          console.log('failed here')
          router.push('/auth')
        }
      }).catch(error => {
        router.push('/auth')
        console.log('failed: ', error.message)
      })
  }, []);

  return (
    <main>
      <Dashboard />
    </main>
  );
}