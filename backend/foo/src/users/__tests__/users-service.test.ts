import faker from 'faker';
import nanoid from 'nanoid';
import {db} from '../../db';
import {User} from '../user';
import * as usersService from '../users-service';

describe('users-service', () => {
  const usersCollectionPath = 'users';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    await db.recursiveDelete(db.collection(usersCollectionPath));
  });

  describe('getOrCreateUser', () => {
    it('given the User does not exist then should create it', async () => {
      const userId = 'new-user-id';

      jest.spyOn(nanoid, 'nanoid').mockReturnValueOnce(userId);

      const options: usersService.CreateUserOptions = {
        uid: faker.datatype.uuid(),
      };

      const result = await usersService.getOrCreateUser(options);

      const document = await db
        .doc(`/${usersCollectionPath}/${result.id}`)
        .get();

      const documentData = document.data() as Omit<User, 'id'>;

      expect(result).toStrictEqual({
        id: userId,
        ...documentData,
      });
    });

    it('given the User exists then should get it', async () => {
      const user: User = {
        id: faker.datatype.uuid(),
        uid: faker.datatype.uuid(),
      };

      const {id: userId, ...userData} = user;

      await db.doc(`${usersCollectionPath}/${userId}`).set(userData);

      const documentsListBefore = await db
        .collection(usersCollectionPath)
        .listDocuments();

      expect(documentsListBefore.length).toBe(1);

      const options: usersService.CreateUserOptions = {
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

  describe('getUserById', () => {
    it('should return an User', async () => {
      const user: User = {
        id: faker.datatype.uuid(),
        uid: faker.datatype.uuid(),
      };

      const {id: userId, ...userData} = user;

      await db.doc(`${usersCollectionPath}/${userId}`).set(userData);

      const result = await usersService.getUserById(userId);

      expect(result).toStrictEqual(user);
    });

    it('given the User does not exist then should return undefined', async () => {
      const result = await usersService.getUserById(faker.datatype.uuid());

      expect(result).toBeUndefined();
    });
  });
});
