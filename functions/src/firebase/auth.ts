import { getAuth, useAuthEmulator } from 'firebase/auth';
import { firebaseApp } from './setup';

export const auth = getAuth(firebaseApp);
useAuthEmulator(auth, 'http://localhost:9099');
