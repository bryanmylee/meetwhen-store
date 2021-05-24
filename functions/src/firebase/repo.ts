import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Identifiable } from '../types/identifiable';
import { firebaseAdmin } from './setup';

export class Repo<T extends Identifiable> {
  protected repo: FirebaseFirestore.CollectionReference;

  constructor(collectionId: string) {
    this.repo = firebaseAdmin.firestore().collection(collectionId);
  }

  async findById(id: string): Promise<T> {
    const ref = this.repo.doc(id);
    const doc = await ref.get();
    const data = doc.data() as Omit<T, 'id'>;
    if (data === undefined) {
      throw new HttpsError('not-found', `meeting(id=${id}) not found`, {
        id: 'not-found',
      });
    }
    return { ...data, id } as T;
  }
}
