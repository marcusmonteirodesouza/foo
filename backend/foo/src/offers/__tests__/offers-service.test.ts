import faker from 'faker';
import nanoid from 'nanoid';
import {db} from '../../db';
import {AppError, CommonErrors} from '../../error-management/errors';
import {usersService} from '../../users';
import {User} from '../../users';
import {Offer} from '../offer';
import * as offersService from '../offers-service';

describe('offers-service', () => {
  const offersCollectionPath = 'offers';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    await db.recursiveDelete(db.collection(offersCollectionPath));
  });

  describe('createOffer', () => {
    const options: offersService.CreateOfferOptions = {
      title: 'Pepperoni Pizza Promotion',
      description: 'Pepperoni pizza with 50% off!',
      categories: [
        'pizza',
        'promotion',
        'offer',
        'discount',
        'italian',
        'food',
      ],
      center: {
        latitude: Number.parseFloat(faker.address.latitude()),
        longitude: Number.parseFloat(faker.address.longitude()),
      },
      radius: faker.datatype.number(),
    };

    it('should create an Offer', async () => {
      const user: User = {
        id: faker.datatype.uuid(),
        uid: faker.datatype.uuid(),
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(user);

      const offerId = 'my-new-offer';

      jest.spyOn(nanoid, 'nanoid').mockReturnValueOnce(offerId);

      const result = await offersService.createOffer(user.id, options);

      const document = await db
        .doc(`${offersCollectionPath}/${result.id}`)
        .get();

      const documentData = document.data() as Omit<Offer, 'id'>;

      expect(result).toStrictEqual({
        id: offerId,
        ...documentData,
      });
    });

    it('given User does not exist then should throw not found', async () => {
      const userId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `User ${userId} not found`
      );

      await expect(offersService.createOffer(userId, options)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('getOfferById', () => {
    it('should return an Offer', async () => {
      const offer: Offer = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Brazilian Wax for $35!',
        categories: ['beauty', 'hair', 'wax'],
        center: {
          latitude: Number.parseFloat(faker.address.latitude()),
          longitude: Number.parseFloat(faker.address.longitude()),
        },
        radius: faker.datatype.number(),
      };

      const {id: offerId, ...documentData} = offer;

      await db.doc(`${offersCollectionPath}/${offerId}`).set(documentData);

      const result = await offersService.getOfferById(offerId);

      expect(result).toStrictEqual(offer);
    });

    it('given Offer does not exist then should throw not found', async () => {
      const offerId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `Offer ${offerId} not found`
      );

      await expect(offersService.getOfferById(offerId)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('listOffersByUserId', () => {
    it("should return all the User's Offers", async () => {
      const user: User = {
        id: 'my-user-id',
        uid: faker.datatype.uuid(),
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(user);

      const userOffers: Offer[] = [
        {
          id: faker.datatype.uuid(),
          userId: user.id,
          title: 'Delicious pizzas and pasta',
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
          title: 'All for $20! Haircut, manicure, and pedicure',
          categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
          center: {
            latitude: Number.parseFloat(faker.address.latitude()),
            longitude: Number.parseFloat(faker.address.longitude()),
          },
          radius: faker.datatype.number(),
        },
      ];

      const anotherOffer: Offer = {
        ...userOffers[0],
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
      };

      await Promise.all(
        [...userOffers, anotherOffer].map(async want => {
          const {id, ...offerData} = want;
          await db.doc(`${offersCollectionPath}/${id}`).set(offerData);
        })
      );

      const result = await offersService.listOffersByUserId(user.id);

      expect(result).toEqual(expect.arrayContaining(userOffers));
    });

    it('given the User does not exist then should throw not found', async () => {
      const userId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `User ${userId} not found`
      );

      await expect(offersService.listOffersByUserId(userId)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('deleteOfferById', () => {
    it('should delete an Offer', async () => {
      const offer: Offer = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'All for $20! Haircut, manicure, and pedicure',
        categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
        center: {
          latitude: Number.parseFloat(faker.address.latitude()),
          longitude: Number.parseFloat(faker.address.longitude()),
        },
        radius: faker.datatype.number(),
      };

      const {id, ...wantData} = offer;

      await db.doc(`${offersCollectionPath}/${id}`).set(wantData);

      await offersService.deleteOfferById(id);

      const document = await db.doc(`${offersCollectionPath}/${id}`).get();

      expect(document.exists).toBe(false);
    });

    it('given the Offer does not exist then should throw not found', async () => {
      const offerId = faker.datatype.uuid();

      const expectedError = new AppError(
        CommonErrors.NotFound,
        `Offer ${offerId} not found`
      );

      await expect(offersService.deleteOfferById(offerId)).rejects.toThrow(
        expectedError
      );
    });
  });
});
