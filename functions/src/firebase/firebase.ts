import * as admin from 'firebase-admin';
import { Service } from 'typedi';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

@Service()
export class FirebaseService {
  auth = admin.auth();
  firestore = admin.firestore();
}
