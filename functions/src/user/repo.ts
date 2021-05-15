import { Service } from 'typedi';
import { database, Repo } from '../database';
import { NewUserInput, User } from './types';

@Service()
export class UserRepo extends Repo<User> {
  constructor() {
    super(database.collection('user'));
  }

  async addNew(newUser: NewUserInput) {
    const newRef = this.repo.doc();
    await newRef.set({ ...newUser });
    return { ...newUser, id: newRef.id } as User;
  }
}
