import { getAuth, useAuthEmulator } from 'firebase/auth';
import { env } from '../env';
import { firebaseApp } from './setup';

export const auth = getAuth(firebaseApp);
if (env.env === 'development') {
  useAuthEmulator(auth, 'http://localhost:9099');
}
