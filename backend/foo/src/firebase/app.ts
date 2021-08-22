import firebase from 'firebase-admin';
import {config} from '../config';

const app = firebase.initializeApp({
  projectId: config.google.projectId,
});

export {app};
