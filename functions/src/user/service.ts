import { HttpsError } from 'firebase-functions/lib/providers/https';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { Inject, Service } from 'typedi';
import { auth } from '../firebase/auth';
import { firebaseAdmin } from '../firebase/setup';
import { UserRepo } from './repo';
import { UserEntry } from './types';

class AddNewArgs {
  name: string;
  email: string;
  password: string;
}

class LoginArgs {
  email: string;
  password: string;
}

@Service()
export class UserService {
  @Inject()
  private repo: UserRepo;

  async findById(id: string): Promise<UserEntry> {
    return this.repo.findById(id);
  }

  async addNew({ name, email, password }: AddNewArgs): Promise<UserEntry> {
    const entry = await this.repo.addNew({ name, email });
    try {
      await firebaseAdmin.auth().createUser({
        uid: entry.id,
        displayName: name,
        email,
        password: password,
      });
    } catch (error) {
      this.repo.deleteById(entry.id);
      throw new HttpsError('already-exists', `user(email=${email} already exists)`);
    }
    return entry;
  }

  async login({ email, password }: LoginArgs): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  }
}
