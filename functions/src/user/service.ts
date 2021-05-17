import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Inject, Service } from 'typedi';
import { auth } from '../firebase/firebase';
import { UserRepo } from './repo';

class AddNewArgs {
  name: string;
  email: string;
  password: string;
}

@Service()
export class UserService {
  @Inject()
  private repo: UserRepo;

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew({ name, email, password }: AddNewArgs) {
    const entry = await this.repo.addNew({ name, email });
    try {
      await auth.createUser({
        uid: entry.id,
        displayName: name,
        email,
        password,
      });
      return entry;
    } catch (error) {
      await this.repo.deleteById(entry.id);
      throw new HttpsError('already-exists', `user(email=${email} already exists)`);
    }
  }
}
