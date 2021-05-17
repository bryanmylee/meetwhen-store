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
    return { id: newRef.id, name, email } as Omit<UserEntry, 'hash'>;
  }

  async deleteById(id: string) {
    return this.repo.doc(id).delete();
  }
  
  async exists({ email }: ExistsArgs) {
    const queried = await this.repo.where('email', '==', email).get();
    return queried.docs.length > 0;
  }
}
