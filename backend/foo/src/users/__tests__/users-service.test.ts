import {db} from '../../db';
import {User} from '../user';
import * as usersService from '../users-service';

describe('users-service', () => {
  const usersCollectionPath = 'users';

  afterEach(async () => {
    await db.recursiveDelete(db.collection(usersCollectionPath));
  });

  describe('getOrCreateUser', () => {
    it('Given the user does not exist then should create it', async () => {
      const options = {
        uid: 'tEnkrTpgNh',
      };

      const result = await usersService.getOrCreateUser(options);

      const document = await db
        .doc(`/${usersCollectionPath}/${result.id}`)
        .get();

      const documentData = document.data() as Omit<User, 'id'>;

      expect(result).toStrictEqual({
        id: result.id,
        uid: documentData.uid,
      });
    });

    it('Given the user exists then should get it', async () => {
      const user = {
        id: 'mfjHMLMZZR',
        uid: 'knfLQovAis',
      };

      await db.doc(`${usersCollectionPath}/${user.id}`).set({
        uid: user.uid,
      });

      const documentsListBefore = await db
        .collection(usersCollectionPath)
        .listDocuments();

      expect(documentsListBefore.length).toBe(1);

      const options = {
        uid: user.uid,
      };

      const result = await usersService.getOrCreateUser(options);

      expect(result).toStrictEqual(user);

      const documentsListAfter = await db
        .collection(usersCollectionPath)
        .listDocuments();

      expect(documentsListAfter).toStrictEqual(documentsListBefore);
    });
  });
});
