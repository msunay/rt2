import { Slot } from 'expo-router';
import { SessionProvider } from '@/services/authctx';
import { Provider } from 'react-redux';
import { store } from '@/store';

export default function Root() {
  return (
    <Provider store={store}>
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </Provider>

  );
}
