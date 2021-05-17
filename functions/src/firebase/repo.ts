import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Identifiable } from '../types/identifiable';
import { firestore } from './firebase';

export class Repo<T extends Identifiable> {
  protected repo: FirebaseFirestore.CollectionReference;

  constructor(collectionId: string) {
    this.repo = firestore.collection(collectionId);
  }

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
