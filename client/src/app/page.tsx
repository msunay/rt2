import styles from "./page.module.css";
import { wrapper } from "./store/store";

function Home() {
  return <main></main>;
}

export default wrapper.withRedux(Home);
