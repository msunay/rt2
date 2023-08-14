import { FormEvent, useEffect, useState } from "react";
import styles from '../styles/signup.module.css'

interface SignUpForm {
  email?: string,
  userName?: string,
  password?: string,
  repeatPassword?: string
}


export default function SignUp() {

  const [form, setForm] = useState<SignUpForm | null>(null);
  const [passwordMatch, setPasswordMatch] = useState(false);

  useEffect(() => {
    setPasswordMatch(validatePassword());
  }, [form?.repeatPassword]);

  function validatePassword() {
    return form?.password !== undefined && form?.password === form?.repeatPassword
  }

  function onSubmitClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log(form);
  }

  // await fetch('')

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
          value={form?.userName || ''}
          onChange={(event) => setForm({ ...form, userName: event.target.value })}
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