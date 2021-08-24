import axios from 'axios';
import {app} from '../../firebase';

export async function getIdToken(uid: string): Promise<string> {
  const customToken = await app.auth().createCustomToken(uid);
  const url =
    'http://localhost:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=fake-api-key';
  const response = await axios.post(url, {
    token: customToken,
    returnSecureToken: true,
  });
  return response.data.idToken;
}
