import firebase from 'firebase/app';
import { config } from '../config';

const app = firebase.initializeApp({
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
});

export default app;
