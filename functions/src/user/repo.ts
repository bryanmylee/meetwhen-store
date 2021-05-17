import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { UserEntry } from './types';

class AddNewArgs {
  name: string;
  email: string;
  hash: string;
}

class ExistsArgs {
  email: string;
}

@Service()
export class UserRepo extends Repo<UserEntry> {
  constructor() {
    super('user');
  }

  async addNew({ name, email, hash }: AddNewArgs) {
    const newRef = await this.repo.add({ name, email, hash });
    return { id: newRef.id, name, email, hash } as UserEntry;
  }

  async deleteById(id: string) {
    return this.repo.doc(id).delete();
  }

  async exists({ email }: ExistsArgs) {
    const results = await this.repo.where('email', '==', email).get();
    return results.docs.length > 0;
  }
  
  async findByEmail(email: string) {
    const results = await this.repo.where('email', '==', email).get();
    if (results.docs.length > 1) {
      throw new HttpsError('internal', `user(email=${email}) not unique`);
    }
    if (results.docs.length === 0) {
      throw new HttpsError('not-found', `user(email=${email} not found)`);
    }
    return results.docs[0].data() as unknown as UserEntry;
  }
}
