import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { database } from '../database';
import { NewUserInput, User } from './types';

@Service()
export class UserRepo {
  readonly repo: FirebaseFirestore.CollectionReference = database.collection('user');

  async findById(id: string) {
    const ref = this.repo.doc(id);
    const doc = await ref.get();
    const data = doc.data();
    if (data === undefined) {
      throw new HttpsError('not-found', `user(id=${id}) not found`);
    }
    return { ...data, id } as User;
  }

  async addNew(newUser: NewUserInput) {
    const newRef = this.repo.doc();
    await newRef.set({ ...newUser });
    return { ...newUser, id: newRef.id } as User;
  }
}
