import faker from 'faker';
import nanoid from 'nanoid';
import {db} from '../../db';
import {AppError, CommonErrors} from '../../error-management/errors';
import {usersService, User} from '../../users';
import {Want} from '../want';
import * as wantsService from '../wants-service';

describe('wants-service', () => {
  const wantsCollectionPath = 'wants';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    await db.recursiveDelete(db.collection(wantsCollectionPath));
  });

  describe('createWant', () => {
    const options: wantsService.CreateWantOptions = {
      title: 'Pizzas and pasta',
      categories: ['pizza', 'pasta', 'food', 'italian'],
      center: {
        latitude: Number.parseFloat(faker.address.latitude()),
        longitude: Number.parseFloat(faker.address.longitude()),
      },
      radius: faker.datatype.number(),
    };

    it('Should create a Want', async () => {
      const wantId = 'new-want-id';

      jest.spyOn(nanoid, 'nanoid').mockReturnValueOnce(wantId);

      const user: User = {
        id: faker.datatype.uuid(),
        uid: faker.datatype.uuid(),
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(user);

      const result = await wantsService.createWant(user.id, options);

      const document = await db.doc(`${wantsCollectionPath}/${wantId}`).get();

      const documentData = document.data();

      expect(documentData).toStrictEqual({userId: user.id, ...options});

      expect(result).toStrictEqual({
        id: wantId,
        ...documentData,
      });
    });

    it('Given user does not exist then should throw not found', async () => {
      const userId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `User ${userId} not found`
      );

      await expect(wantsService.createWant(userId, options)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('getWantById', () => {
    it('Should return a Want', async () => {
      const want: Want = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Haircuts, sallons, manicures, pedicures',
        categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
        center: {
          latitude: Number.parseFloat(faker.address.latitude()),
          longitude: Number.parseFloat(faker.address.longitude()),
        },
        radius: faker.datatype.number(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {id, ...wantData} = want;

      await db.doc(`${wantsCollectionPath}/${want.id}`).set(wantData);

      const result = await wantsService.getWantById(want.id);

      expect(result).toStrictEqual(want);
    });

    it('Given the Want does not exist then should throw not found', async () => {
      const wantId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `Want ${wantId} not found`
      );

      await expect(wantsService.getWantById(wantId)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('listWantsByUserId', () => {
    it("Should return all the User's Wants", async () => {
      const user: User = {
        id: 'my-user-id',
        uid: faker.datatype.uuid(),
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(user);

      const userWants: Want[] = [
        {
          id: faker.datatype.uuid(),
          userId: user.id,
          title: 'Pizzas and pasta',
          categories: ['pizza', 'pasta', 'food', 'italian'],
          center: {
            latitude: Number.parseFloat(faker.address.latitude()),
            longitude: Number.parseFloat(faker.address.longitude()),
          },
          radius: faker.datatype.number(),
        },
        {
          id: faker.datatype.uuid(),
          userId: user.id,
          title: 'Haircuts, sallons, manicures, pedicures',
          categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
          center: {
            latitude: Number.parseFloat(faker.address.latitude()),
            longitude: Number.parseFloat(faker.address.longitude()),
          },
          radius: faker.datatype.number(),
        },
      ];

      const anotherWant: Want = {
        ...userWants[0],
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
      };

      await Promise.all(
        [...userWants, anotherWant].map(async want => {
          const {id, ...wantData} = want;
          await db.doc(`${wantsCollectionPath}/${id}`).set(wantData);
        })
      );

      const result = await wantsService.listWantsByUserId(user.id);

      expect(result).toEqual(expect.arrayContaining(userWants));
    });

    it('Given the User does not exist then should throw not found', async () => {
      const userId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `User ${userId} not found`
      );

      await expect(wantsService.listWantsByUserId(userId)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('deleteWantById', () => {
    it('Should delete a Want', async () => {
      const want: Want = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Haircuts, sallons, manicures, pedicures',
        categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
        center: {
          latitude: Number.parseFloat(faker.address.latitude()),
          longitude: Number.parseFloat(faker.address.longitude()),
        },
        radius: faker.datatype.number(),
      };

      const {id, ...wantData} = want;

      await db.doc(`${wantsCollectionPath}/${id}`).set(wantData);

      await wantsService.deleteWantById(id);

      const document = await db.doc(`${wantsCollectionPath}/${id}`).get();

      expect(document.exists).toBe(false);
    });

    it('Given the Want does not exist then should throw not found', async () => {
      const wantId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `Want ${wantId} not found`
      );

      await expect(wantsService.deleteWantById(wantId)).rejects.toThrow(
        expectedError
      );
    });
  });
});
