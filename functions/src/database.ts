import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Identifiable } from './types/identifiable';

export class Repo<T extends Identifiable> {
  constructor(protected repo: FirebaseFirestore.CollectionReference) {}

  async findById(id: string) {
    const ref = this.repo.doc(id);
    const doc = await ref.get();
    const data = doc.data() as any;
    if (data === undefined) {
      throw new HttpsError('not-found', `user(id=${id}) not found`);
    }
    return { ...data, id } as T;
  }
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const database = admin.firestore();
