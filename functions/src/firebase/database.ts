import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Inject, Service } from 'typedi';
import { Identifiable } from '../types/identifiable';
import { FirebaseService } from './firebase';

const database = admin.firestore();

@Service()
export class Repo<T extends Identifiable> {
  @Inject()
  firebase: FirebaseService;

  protected repo: FirebaseFirestore.CollectionReference;

  constructor(collectionId: string) {
    this.repo = database.collection(collectionId);
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
