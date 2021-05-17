import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const firebaseAdmin = admin;

const firebaseConfig = {
  apiKey: 'AIzaSyBCU9eFkutJr4lcatVLgwGvMtzaMO1usBo',
  authDomain: 'meetwhen-store.firebaseapp.com',
  projectId: 'meetwhen-store',
  storageBucket: 'meetwhen-store.appspot.com',
  messagingSenderId: '675479103941',
  appId: '1:675479103941:web:99d89d6c6f0f6cccde43ac',
};

export const firebaseApp = initializeApp(firebaseConfig);
