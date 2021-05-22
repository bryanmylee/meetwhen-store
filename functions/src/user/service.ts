import { HttpsError } from 'firebase-functions/lib/providers/https';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
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
    } catch {
      throw new HttpsError('not-found', `user(id=${id}) not found`);
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
    } catch {
      throw new HttpsError('already-exists', `user(email=${email}) already exists`);
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
      console.log(error);
      throw new HttpsError('internal', `user(id=${id}) update failed`);
    }
  }

  async login({ email, password }: LoginArgs): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  }
}
