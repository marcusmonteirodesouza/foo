import faker from 'faker';
import { app } from '../../../../firebase';
import * as testUtils from '../test-utils';

describe('test-utils', () => {
  describe('getIdToken', () => {
    it('should return an idToken', async () => {
      const uid = faker.datatype.uuid();

      const result = await testUtils.getIdToken(uid);

      const decodedIdToken = await app.auth().verifyIdToken(result);

      expect(decodedIdToken.uid).toBe(uid);
    });
  });
});
