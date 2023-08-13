import styles from "../styles/login.module.css";
import { useState } from "react";

interface SignUpForm {
  email?: string,
  password?: string
}

interface PageProps {
  setSignupVisible: (visibility: boolean) => void;
}

export default function Login({ setSignupVisible }: PageProps) {

  const [form, setForm] = useState<SignUpForm | null>(null);

  return (
    <div className={styles.login_wrapper}>
      <form action="" className={styles.form}>
        <input
          required
          id="email"
          name="email"
          type="text"
          placeholder="Email"
          value={form?.email || ''}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          required
          id="new-password"
          name="password"
          type="password"
          placeholder="Password"
          value={form?.password || ''}
          autoComplete="on"
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <button type="submit">Submit</button>
        <div className={styles.sign_options}>
          <p onClick={() => setSignupVisible(true)}>sign-up</p>
          <p>forgot your password?</p>
        </div>
      </form>
    </div>
  )
}