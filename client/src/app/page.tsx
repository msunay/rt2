"use client";
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";

export default function Home() {
  const authState = useAppSelector((state: RootState) => state.authSlice.authState)
  const router = useRouter();

  useEffect(() => {
    if (!authState) router.push('/auth');
  }, [authState]);

  return (
    <main>
      <>App</>
    </main>
  );
}