"use client";
import { RootState } from "../redux/store";
import { setAuthState } from '../redux/features/authSlice'
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";

export default function Home() {
  const authState = useAppSelector((state: RootState) => state.authSlice.authState)
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (authState) router.push('/auth')
  }, [authState]);

  return (
    <main>

      <div onClick={() => dispatch(setAuthState(!authState))}> Click me</div>
      <>App</>

    </main>
  );
}