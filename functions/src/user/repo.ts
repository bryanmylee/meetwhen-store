import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { UserEntry } from './types';

class AddNewArgs {
  name: string;
}

@Service()
export class UserRepo extends Repo<UserEntry> {
  constructor() {
    super('user');
  }

  async addNew(newUser: AddNewArgs) {
    const newRef = this.repo.doc();
    await newRef.set({ ...newUser });
    return { ...newUser, id: newRef.id } as UserEntry;
  }
}
