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

class AddNewGuestArgs {
  meetingId: string;
  username: string;
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

class LoginGuestArgs {
  meetingId: string;
  username: string;
  password: string;
}

@Service()
export class UserService {
  async findById(id: string): Promise<UserShallow> {
    try {
      const record = await firebaseAdmin.auth().getUser(id);
      const guestOf = record.customClaims?.guestOf;
      return {
        id: record.uid,
        email: record.email!,
        name: record.displayName!,
        guestOf,
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
      firebaseAdmin.auth().setCustomUserClaims(record.uid, { guestOf: null });
      return {
        id: record.uid,
        email: record.email!,
        name: record.displayName!,
        guestOf: null,
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async addNewGuest({ username, password, meetingId }: AddNewGuestArgs): Promise<UserShallow> {
    try {
      const record = await firebaseAdmin.auth().createUser({
        displayName: username,
        email: getGuestEmail(meetingId, username),
        password: password,
      });
      firebaseAdmin.auth().setCustomUserClaims(record.uid, { guestOf: meetingId });
      return {
        id: record.uid,
        email: record.email!,
        name: record.displayName!,
        guestOf: meetingId,
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
        guestOf: null,
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

  async loginGuest({ meetingId, username, password }: LoginGuestArgs): Promise<User> {
    const email = getGuestEmail(meetingId, username);
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
    new HttpsError('permission-denied', message, { id: 'auth/too-many-requests' });
  }
  if (code === 'auth/wrong-password') {
    throw new HttpsError('permission-denied', `wrong password`, { id: 'auth/wrong-password' });
  }
  if (code === 'auth/user-not-found') {
    throw new HttpsError('not-found', message, { id: 'auth/user-not-found' });
  }
  if (code === 'auth/missing-email') {
    throw new HttpsError('not-found', message, { id: 'auth/missing-email' });
  }
  if (code === 'auth/email-already-exists') {
    throw new HttpsError('already-exists', message, { id: 'auth/email-already-exists' });
  }
  throw new HttpsError('internal', message, { id: code });
};

const getGuestEmail = (meetingId: string, username: string) => `${username}.${meetingId}@guest`;
