import { FormEvent, useEffect, useState } from "react";
import styles from '@/app/auth/styles/signup.module.css';
import { useAppDispatch } from "@/redux/hooks";
import { genSaltSync, hashSync } from "bcrypt-ts"
import { setAuthState } from '../../redux/features/authSlice'
import { useRouter } from "next/navigation"
import { userApiService } from '../../redux/services/apiService'

interface SignUpForm {
  email?: string,
  username?: string,
  password?: string,
  repeatPassword?: string
}

export default function SignUp() {

  const dispatch = useAppDispatch();
  const [form, setForm] = useState<SignUpForm | null>(null);
  const [passwordMatch, setPasswordMatch] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setPasswordMatch(validatePassword());
  }, [form?.repeatPassword]);

  function validatePassword() {
    return form?.password !== undefined && form?.password === form?.repeatPassword
  }

  async function onSubmitClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof form?.password === 'undefined' ||
      typeof form?.email === 'undefined' ||
      typeof form?.username === 'undefined') return;
    const salt = genSaltSync(10);
    const hash = hashSync(form.password, salt);
    try {
      const data = await userApiService.postUser({ email: form.email, username: form.username, password: hash })
      if (data.dataValues.username) {
        dispatch(setAuthState(data.token))
        localStorage.setItem('jwt_token', data.token)
        router.push('/');
      } else {
        dispatch(setAuthState(''));
        localStorage.setItem('jwt_token', '');
        router.push('/auth');
      }
    } catch (error) {
      dispatch(setAuthState(''));
      localStorage.setItem('jwt_token', '');
      router.push('/auth');
    }
  }

  return (
    <div >
      <form onSubmit={(e) => onSubmitClick(e)} className={styles.form}>
        <input
          required
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={form?.email || ''}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />

        <input
          required
          id="username"
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

        <input
          required
          name="password"
          type="password"
          placeholder="Repeat password"
          value={form?.repeatPassword || ''}
          autoComplete="on"
          onChange={(event) => setForm({ ...form, repeatPassword: event.target.value })}
        />

        <button type="submit" disabled={!passwordMatch}>Submit</button>
      </form>
    </div>
  )
}