import { Response } from 'express';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { AuthError, signInWithEmailAndPassword } from 'firebase/auth';
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

const SESSION_COOKIE_HEADER = '__access-token';

@Service()
export class UserService {
  async findById(id: string): Promise<UserShallow> {
    try {
      const record = await firebaseAdmin.auth().getUser(id);
      return {
        id: record.uid,
        email: record.email!,
        ...getDecodedDisplayName(record.displayName!),
      };
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async addNew({ name, email, password }: AddNewArgs): Promise<UserShallow> {
    if (name.includes(';')) {
      throw new HttpsError('invalid-argument', 'only alphanumeric characters allowed for name');
    }
    try {
      const record = await firebaseAdmin.auth().createUser({
        displayName: getEncodedDisplayName(name),
        email,
        password: password,
      });
      return {
        id: record.uid,
        email,
        name,
        guestOf: null,
      };
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async addNewGuest({ username, password, meetingId }: AddNewGuestArgs): Promise<UserShallow> {
    if (username.includes(';')) {
      throw new HttpsError('invalid-argument', 'only alphanumeric characters allowed for name');
    }
    try {
      const record = await firebaseAdmin.auth().createUser({
        displayName: getEncodedDisplayName(username, meetingId),
        email: getGuestEmail(meetingId, username),
        password: password,
      });
      return {
        id: record.uid,
        email: record.email!,
        name: username,
        guestOf: meetingId,
      };
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async edit({ id, ...args }: EditArgs): Promise<UserShallow> {
    try {
      // manually handle display name edit due to custom encoding.
      const user = await this.findById(id);
      const { guestOf } = getDecodedDisplayName(user.name);
      const displayName =
        args.name !== undefined
          ? getEncodedDisplayName(args.name, guestOf ?? undefined)
          : user.name;
      const record = await firebaseAdmin.auth().updateUser(id, {
        email: args.email,
        displayName,
        password: args.password,
      });
      return {
        id: record.uid,
        email: record.email!,
        ...getDecodedDisplayName(record.displayName!),
      };
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async deleteById(id: string, response: Response): Promise<void> {
    try {
      await firebaseAdmin.auth().deleteUser(id);
      await this.logout(response);
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async login(
    { email, password }: LoginArgs,
    response: Response
  ): Promise<UserShallow & { sessionCookie: string }> {
    const DAYS_IN_MS = 86_400_000;
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      // audience = meetwhen-store
      // issuer   = https://securetoken.google.com/meetwhen-store
      const idToken = await user.getIdToken();
      // audience = meetwhen-store
      // issuer   = https://session.firebase.google.com/meetwhen-store
      const sessionCookie = await firebaseAdmin
        .auth()
        .createSessionCookie(idToken, { expiresIn: 14 * DAYS_IN_MS });
      response.setHeader(SESSION_COOKIE_HEADER, sessionCookie);
      return {
        id: user.uid,
        email: user.email!,
        sessionCookie: sessionCookie,
        ...getDecodedDisplayName(user.displayName!),
      };
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async loginGuest(
    { meetingId, username, password }: LoginGuestArgs,
    response: Response
  ): Promise<UserShallow & { sessionCookie: string }> {
    const email = getGuestEmail(meetingId, username);
    return this.login({ email, password }, response);
  }

  async logout(response: Response): Promise<boolean> {
    // Signal to the client to delete the access token cookie.
    // '' empty string clears the header.
    response.setHeader(SESSION_COOKIE_HEADER, '_');
    return true;
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

export const getEncodedDisplayName = (name: string, meetingId = ''): string =>
  name + ';' + meetingId;

export const getDecodedDisplayName = (
  displayName: string
): { name: string; guestOf: string | null } => {
  const [name, guestOf] = displayName.split(';');
  if (guestOf === '') {
    return { name, guestOf: null };
  }
  return { name, guestOf };
};

export const getGuestEmail = (meetingId: string, username: string): string =>
  `${username.replace(/\s+/g, '_')}@${meetingId}.guest`;
