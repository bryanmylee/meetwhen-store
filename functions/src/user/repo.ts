import { Service } from 'typedi';
import { database, Repo } from '../database';
import { NewUserInput, UserEntry } from './types';

@Service()
export class UserRepo extends Repo<UserEntry> {
  constructor() {
    super(database.collection('user'));
  }

  async addNew(newUser: NewUserInput) {
    const newRef = this.repo.doc();
    await newRef.set({ ...newUser });
    return { ...newUser, id: newRef.id } as UserEntry;
  }
}
