import { HttpsError } from 'firebase-functions/lib/providers/https';
import { AuthError, signInWithEmailAndPassword, User } from 'firebase/auth';
import { Service } from 'typedi';
import { auth } from '../firebase/auth';
import { firebaseAdmin } from '../firebase/setup';
import { UserShallow } from './types';

class AddNewArgs {
  name: string;
  email: string;
  password: string;
}

class EditArgs {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

class LoginArgs {
  email: string;
  password: string;
}

@Service()
export class UserService {
  async findById(id: string): Promise<UserShallow> {
    try {
      const record = await firebaseAdmin.auth().getUser(id);
      return {
        id: record.uid,
        email: record.email!,
        name: record.displayName!,
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async addNew({ name, email, password }: AddNewArgs): Promise<UserShallow> {
    try {
      const record = await firebaseAdmin.auth().createUser({
        displayName: name,
        email,
        password: password,
      });
      return {
        id: record.uid,
        email: record.email!,
        name: record.displayName!,
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async edit({ id, ...args }: EditArgs): Promise<UserShallow> {
    try {
      const record = await firebaseAdmin.auth().updateUser(id, {
        email: args.email,
        displayName: args.name,
        password: args.password,
      });
      return {
        id: record.uid,
        email: record.email!,
        name: record.displayName!,
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async login({ email, password }: LoginArgs): Promise<User> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      throw handleError(error);
    }
  }
}

const handleError = ({ message, code }: AuthError) => {
  if (code === 'auth/too-many-requests') {
    new HttpsError('permission-denied', message, { id: 'too-many-requests' });
  }
  if (code === 'auth/wrong-password') {
    throw new HttpsError('permission-denied', `wrong password`, { id: 'wrong-password' });
  }
  if (code === 'auth/user-not-found') {
    throw new HttpsError('not-found', message, { id: 'not-found' });
  }
  if (code === 'auth/email-already-exists') {
    throw new HttpsError('already-exists', message, { id: 'already-exists' });
  }
  throw new HttpsError('internal', message, { id: code });
};
