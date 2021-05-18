import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { UserEntry } from './types';

class AddNewArgs {
  name: string;
  email: string;
}

@Service()
export class UserRepo extends Repo<UserEntry> {
  constructor() {
    super('user');
  }

  async addNew({ name, email }: AddNewArgs): Promise<UserEntry> {
    const newRef = await this.repo.add({ name, email });
    return { id: newRef.id, name, email } as UserEntry;
  }

  async deleteById(id: string): Promise<FirebaseFirestore.WriteResult> {
    return this.repo.doc(id).delete();
  }

  async findByEmail(email: string): Promise<UserEntry> {
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
