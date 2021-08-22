import React, { useEffect, useState } from 'react';
import app from './firebase';
import StyledFirebaseAuth from './components/styled-firebase-auth';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unregisterAuthObserver = app
      .auth()
      .onAuthStateChanged(async (user) => {
        if (user) {
          const token = await user.getIdToken();
          console.log(token);
        }
        setIsSignedIn(!!user);
      });
    return () => unregisterAuthObserver();
  }, []);

  if (!isSignedIn) {
    return (
      <div>
        <h1>My App</h1>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth />
      </div>
    );
  }

  return (
    <div>
      <h1>My App</h1>
      <p>
        Welcome {app.auth().currentUser!.displayName}! You are now signed-in!
      </p>
      <a onClick={() => app.auth().signOut()}>Sign-out</a>
    </div>
  );
}

export default App;
