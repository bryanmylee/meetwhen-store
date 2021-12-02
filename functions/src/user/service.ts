import { Response } from 'express';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { AuthError, signInWithEmailAndPassword } from 'firebase/auth';
import { Inject, Service } from 'typedi';
import { auth } from '../firebase/auth';
import { firebaseAdmin } from '../firebase/setup';
import { NoPassUserRepo } from './no-pass-repo';
import { UserRepo } from './repo';
import { UserShallow } from './types';

class AddNewArgs {
  name: string;
  email: string;
  password: string;
}

class AddNewGuestArgs {
  meetingId: string;
  username: string;
  password?: string;
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
  @Inject()
  private repo: UserRepo;

  @Inject()
  private noPassRepo: NoPassUserRepo;

  async findById(id: string): Promise<UserShallow> {
    try {
      return await this.repo.findById(id);
    } catch (error) {
      return await this.noPassRepo.findById(id);
    }
  }

  async addNew({ name, email, password }: AddNewArgs): Promise<UserShallow> {
    if (name.includes(';')) {
      throw new HttpsError('invalid-argument', 'only alphanumeric characters allowed for name');
    }
    try {
      return this.repo.addNew({ name, email, password });
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async addNewGuest({ username, password, meetingId }: AddNewGuestArgs): Promise<UserShallow> {
    if (username.includes(';')) {
      throw new HttpsError('invalid-argument', 'only alphanumeric characters allowed for name');
    }
    try {
      if (password !== undefined && password !== '') {
        return this.repo.addNewGuest({ username, password, meetingId });
      }
      return this.noPassRepo.addNewGuest({ username, meetingId });
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async hasPassword(id: string): Promise<boolean> {
    try {
      await this.repo.findById(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async editById({ id, email, name, password }: EditArgs): Promise<UserShallow> {
    if (!(await this.hasPassword(id))) {
      throw new HttpsError('permission-denied', 'cannot edit user without password', {
        id: 'auth/no-pass-user-edit',
      });
    }
    try {
      return this.repo.edit({ id, email, name, password });
    } catch (error) {
      throw handleError(error as AuthError);
    }
  }

  async deleteById(id: string, response: Response): Promise<void> {
    try {
      if (await this.hasPassword(id)) {
        await this.repo.deleteById(id);
      } else {
        await this.noPassRepo.deleteById(id);
      }
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
      const record = await this.findById(user.uid);
      return {
        ...record,
        sessionCookie: sessionCookie,
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

export const getGuestEmail = (meetingId: string, username: string): string =>
  `${username.replace(/\s+/g, '_')}@${meetingId}.guest`;
