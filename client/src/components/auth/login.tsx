import styles from "@/styles/login.module.css";
import { FormEvent, useState } from "react";
import { compareSync } from "bcrypt-ts"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hooks";
import { setAuthState } from '@/redux/features/authSlice';
import { userApiService } from "@/redux/services/apiService";

interface SignUpForm {
  username?: string,
  password?: string
}

interface PageProps {
  setSignupVisible: (visibility: boolean) => void;
  setLoginVisible: (visibility: boolean) => void;
}

export default function Login({ setSignupVisible, setLoginVisible }: PageProps) {

  const [form, setForm] = useState<SignUpForm | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  function onSignupClick() {
    setSignupVisible(true);
    setLoginVisible(false)
  }

  async function onSubmitClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof form?.username === 'undefined' || typeof form?.password === 'undefined') return;
    try {
      const data = await userApiService.loginUser(form.username);

      // BUG
      //TODO bad security needs to be on backend
      if (compareSync(form.password, data.dataValues.password)) {
        dispatch(setAuthState(data.token))
        localStorage.setItem('jwt_token', data.token)
        router.push('/dashboard');
      } else {
        dispatch(setAuthState(""));
        localStorage.setItem('jwt_token', '');
        throw new Error('Not correct credentials')
      }
    } catch (error) {
      console.log(error);
      router.push('/');
    }
  }


  return (
    <div className={styles.login_wrapper}>
      <form onSubmit={event => onSubmitClick(event)} className={styles.form}>
        <input
          required
          name="username"
          type="text"
          placeholder="User name"
          value={form?.username || ''}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
        />
        <input
          required
          name="password"
          type="password"
          placeholder="Password"
          value={form?.password || ''}
          autoComplete="on"
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <button type="submit">Submit</button>
        <div className={styles.sign_options}>
          <p onClick={() => onSignupClick()}>sign-up</p>
          <p>forgot your password?</p>
        </div>
      </form>
    </div>
  )
}