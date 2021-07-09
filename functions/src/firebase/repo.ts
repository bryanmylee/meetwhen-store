import { HttpsError } from 'firebase-functions/lib/providers/https';
import { zip } from '../utils/zip';
import { Identifiable } from '../types/identifiable';
import { firebaseAdmin } from './setup';

export class Repo<T extends Identifiable> {
  protected repo: FirebaseFirestore.CollectionReference;

  constructor(private collectionId: string) {
    this.repo = firebaseAdmin.firestore().collection(collectionId);
  }

  async findById(id: string): Promise<T> {
    const ref = this.repo.doc(id);
    const doc = await ref.get();
    const data = doc.data() as Omit<T, 'id'>;
    if (data === undefined) {
      throw new HttpsError('not-found', `${this.collectionId}(id=${id}) not found`, {
        id: 'not-found',
      });
    }
    return { ...data, id } as T;
  }

  async populate(ids: string[]): Promise<T[]> {
    if (ids.length === 0) {
      return [];
    }
    const query = this.repo.where(firebaseAdmin.firestore.FieldPath.documentId(), 'in', ids);
    const results = await query.get();
    const dataEntries = results.docs.map((doc) => doc.data() as Omit<T, 'id'>);
    if (dataEntries === undefined || dataEntries.length !== ids.length) {
      throw new HttpsError('internal', `${this.collectionId}(ids=${ids}) failed to populate`, {
        id: 'internal',
      });
    }
    return zip(ids, dataEntries).map(([id, data]) => ({ ...data, id } as T));
  }
}
