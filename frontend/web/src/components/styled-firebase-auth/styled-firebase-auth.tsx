import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import { StyledFirebaseAuth } from 'react-firebaseui';
import app from '../../firebase';

// See https://github.com/firebase/firebaseui-web-react
const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: () => false, // Avoid redirects after sign-in.
  },
};

function _StyledFirebaseAuth() {
  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={app.auth()} />;
}

export default _StyledFirebaseAuth;
