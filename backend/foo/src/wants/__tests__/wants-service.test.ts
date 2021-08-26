import faker from 'faker';
import nanoid from 'nanoid';
import * as geofire from 'geofire-common';
import { db } from '../../db';
import { AppError, CommonErrors } from '../../error-management/errors';
import { usersService, User } from '../../users';
import { Want } from '../want';
import * as wantsService from '../wants-service';

describe('wants-service', () => {
  const wantsCollectionPath = 'wants';

  function getRandomCenter(): {
    latitude: number;
    longitude: number;
    geohash: string;
  } {
    const latitude = Number.parseFloat(faker.address.latitude());
    const longitude = Number.parseFloat(faker.address.longitude());
    const geohash = geofire.geohashForLocation([latitude, longitude]);
    return {
      latitude,
      longitude,
      geohash,
    };
  }

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

    it('should create a Want', async () => {
      const wantId = 'new-want-id';

      jest.spyOn(nanoid, 'nanoid').mockReturnValueOnce(wantId);

      const user: User = {
        id: faker.datatype.uuid(),
        uid: faker.datatype.uuid(),
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(user);

      const result = await wantsService.createWant(user.id, options);

      const document = await db
        .doc(`${wantsCollectionPath}/${result.id}`)
        .get();

      const documentData = document.data() as Omit<Want, 'id'>;

      expect(result).toStrictEqual({
        id: wantId,
        ...documentData,
      });
    });

    it('given user does not exist then should throw not found', async () => {
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
    it('should return a Want', async () => {
      const want: Want = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Haircuts, sallons, manicures, pedicures',
        categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
        center: getRandomCenter(),
        radiusInMeters: faker.datatype.number(),
      };

      const { id: wantId, ...wantData } = want;

      await db.doc(`${wantsCollectionPath}/${wantId}`).set(wantData);

      const result = await wantsService.getWantById(wantId);

      expect(result).toStrictEqual(want);
    });

    it('given the Want does not exist then should return undefined', async () => {
      const wantId = faker.datatype.uuid();

      const result = await wantsService.getWantById(wantId);

      expect(result).toBeUndefined();
    });
  });

  describe('listWantsByUserId', () => {
    it("should return all the User's Wants", async () => {
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
          center: getRandomCenter(),
          radiusInMeters: faker.datatype.number(),
        },
        {
          id: faker.datatype.uuid(),
          userId: user.id,
          title: 'Haircuts, sallons, manicures, pedicures',
          categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
          center: getRandomCenter(),
          radiusInMeters: faker.datatype.number(),
        },
      ];

      const anotherWant: Want = {
        ...userWants[0],
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
      };

      await Promise.all(
        [...userWants, anotherWant].map(async (want) => {
          const { id, ...wantData } = want;
          await db.doc(`${wantsCollectionPath}/${id}`).set(wantData);
        })
      );

      const result = await wantsService.listWantsByUserId(user.id);

      expect(result).toEqual(expect.arrayContaining(userWants));
    });

    it('given the User does not exist then should throw not found', async () => {
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
    it('should delete a Want', async () => {
      const want: Want = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Haircuts, sallons, manicures, pedicures',
        categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
        center: getRandomCenter(),
        radiusInMeters: faker.datatype.number(),
      };

      const { id, ...wantData } = want;

      await db.doc(`${wantsCollectionPath}/${id}`).set(wantData);

      await wantsService.deleteWantById(id);

      const document = await db.doc(`${wantsCollectionPath}/${id}`).get();

      expect(document.exists).toBe(false);
    });

    it('given the Want does not exist then should throw not found', async () => {
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
