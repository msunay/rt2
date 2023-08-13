"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { setAuthState } from '../redux/features/authSlice'
import { useRouter } from "next/navigation"

export default function Home() {

  const authState = useSelector((state: RootState) => state.authSlice.authState)
  const dispatch = useDispatch();
  const router = useRouter();


  return (
    <main>
      <>
        <div onClick={() => dispatch(setAuthState(!authState))}> Click me</div>
        {
          !authState ? <>App</> : router.push('/login')
        }
      </>
    </main>
  );
}