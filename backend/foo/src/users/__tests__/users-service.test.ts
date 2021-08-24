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
    it('Given the User does not exist then should create it', async () => {
      const id = 'new-user-id';

      jest.spyOn(nanoid, 'nanoid').mockReturnValueOnce(id);

      const options: usersService.CreateUserOptions = {
        uid: faker.datatype.uuid(),
      };

      const result = await usersService.getOrCreateUser(options);

      const document = await db.doc(`/${usersCollectionPath}/${id}`).get();

      const documentData = document.data() as Omit<User, 'id'>;

      expect(documentData).toStrictEqual(options);

      expect(result).toStrictEqual({
        id,
        ...documentData,
      });
    });

    it('Given the User exists then should get it', async () => {
      const user: User = {
        id: faker.datatype.uuid(),
        uid: faker.datatype.uuid(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {id, ...userData} = user;

      await db.doc(`${usersCollectionPath}/${user.id}`).set(userData);

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
    it('Should return an User', async () => {
      const user: User = {
        id: faker.datatype.uuid(),
        uid: faker.datatype.uuid(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {id, ...userData} = user;

      await db.doc(`${usersCollectionPath}/${user.id}`).set(userData);

      const result = await usersService.getUserById(user.id);

      expect(result).toStrictEqual(user);
    });

    it('Given the User does not exist then should return undefined', async () => {
      const result = await usersService.getUserById(faker.datatype.uuid());

      expect(result).toBeUndefined();
    });
  });
});
