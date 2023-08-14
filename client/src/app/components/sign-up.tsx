import { FormEvent, useEffect, useState } from "react";
import styles from '../styles/signup.module.css';
import { useAppDispatch } from "@/redux/hooks";
import { genSaltSync, hashSync } from "bcrypt-ts"
import { setAuthState } from '../../redux/features/authSlice'
import { useRouter } from "next/navigation"
import { useAddUserMutation } from '../../redux/services/userApi'

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
  const [addNewUser] = useAddUserMutation();
  const router = useRouter();

  useEffect(() => {
    setPasswordMatch(validatePassword());
  }, [form?.repeatPassword]);

  function validatePassword() {
    return form?.password !== undefined && form?.password === form?.repeatPassword
  }

  async function onSubmitClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof form?.password === 'undefined') return;
    const salt = genSaltSync(10);
    const hash = hashSync(form.password, salt);

    addNewUser({ email: form?.email, username: form?.username, password: hash })
      .then((data) => {
        if (data) {
          dispatch(setAuthState(true))
        }
        else dispatch(setAuthState(false))
        router.push('/')
      })
      .catch((error) => {
        console.log(error);
      });
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