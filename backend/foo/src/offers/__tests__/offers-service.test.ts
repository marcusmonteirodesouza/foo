import faker from 'faker';
import nanoid from 'nanoid';
import * as geofire from 'geofire-common';
import { db } from '../../db';
import { AppError, CommonErrors } from '../../error-management/errors';
import { Coordinates } from '../../common/types';
import { usersService } from '../../users';
import { User } from '../../users';
import { Offer } from '../offer';
import * as offersService from '../offers-service';
import { Want, wantsService } from '../../wants';

describe('offers-service', () => {
  const offersCollectionPath = 'offers';

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
        center: getRandomCenter(),
        radiusInMeters: faker.datatype.number(),
      };

      const { id: offerId, ...documentData } = offer;

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
          center: getRandomCenter(),
          radiusInMeters: faker.datatype.number(),
        },
        {
          id: faker.datatype.uuid(),
          userId: user.id,
          title: 'All for $20! Haircut, manicure, and pedicure',
          categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
          center: getRandomCenter(),
          radiusInMeters: faker.datatype.number(),
        },
      ];

      const anotherOffer: Offer = {
        ...userOffers[0],
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
      };

      await Promise.all(
        [...userOffers, anotherOffer].map(async (want) => {
          const { id, ...offerData } = want;
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

  describe('listOffersByWantId', () => {
    it("should return the list of Offers inside Want's radius and whose own radius contains the Want's center", async () => {
      const wantCoordinates: Coordinates = {
        latitude: 46.8074117,
        longitude: -71.2250098,
      };

      const want: Want = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Pizza',
        categories: ['pizza', 'italian', 'food'],
        center: {
          latitude: wantCoordinates.latitude,
          longitude: wantCoordinates.longitude,
          geohash: geofire.geohashForLocation([
            wantCoordinates.latitude,
            wantCoordinates.longitude,
          ]),
        },
        radiusInMeters: 6000,
      };

      const offerInWantRadiusAndWantInOwnRadiusCoordinates: Coordinates = {
        latitude: 46.811823964359135,
        longitude: -71.23307921390816,
      };

      const offerInWantRadiusAndWantInOwnRadius: Offer = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Pizza promotion',
        description: 'All medium pizzas 10% OFF!',
        categories: ['pizza', 'italian', 'food', 'promotion'],
        center: {
          latitude: offerInWantRadiusAndWantInOwnRadiusCoordinates.latitude,
          longitude: offerInWantRadiusAndWantInOwnRadiusCoordinates.longitude,
          geohash: geofire.geohashForLocation([
            offerInWantRadiusAndWantInOwnRadiusCoordinates.latitude,
            offerInWantRadiusAndWantInOwnRadiusCoordinates.longitude,
          ]),
        },
        radiusInMeters: 1000,
      };

      const anotherOfferInWantRadiusAndWantInOwnRadiusCoordinates: Coordinates = {
        latitude: 46.81099981030187,
        longitude: -71.21557232710155,
      };

      const anotherOfferInWantRadiusAndWantInOwnRadius: Offer = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Pepperoni Pizza promotion',
        description: 'Pepperoni pizzas with double cheese for the same price!',
        categories: ['pizza', 'italian', 'food', 'pepperoni', 'promotion'],
        center: {
          latitude: anotherOfferInWantRadiusAndWantInOwnRadiusCoordinates.latitude,
          longitude: anotherOfferInWantRadiusAndWantInOwnRadiusCoordinates.longitude,
          geohash: geofire.geohashForLocation([
            anotherOfferInWantRadiusAndWantInOwnRadiusCoordinates.latitude,
            anotherOfferInWantRadiusAndWantInOwnRadiusCoordinates.longitude,
          ]),
        },
        radiusInMeters: 900,
      };

      const offerInWantRadiusButOutsideOwnRadiusCoordinates: Coordinates = {
        latitude: 46.77305984329318,
        longitude: -71.28302809995951,
      };

      const offerInWantRadiusButOutsideOwnRadius: Offer = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'Pizza SALE!',
        description: 'All pizzas 30% OFF!!',
        categories: ['pizza', 'sale', 'italian', 'food', 'promotion'],
        center: {
          latitude: offerInWantRadiusButOutsideOwnRadiusCoordinates.latitude,
          longitude: offerInWantRadiusButOutsideOwnRadiusCoordinates.longitude,
          geohash: geofire.geohashForLocation([
            offerInWantRadiusButOutsideOwnRadiusCoordinates.latitude,
            offerInWantRadiusButOutsideOwnRadiusCoordinates.longitude,
          ]),
        },
        radiusInMeters: 5000,
      };

      const offerOutsideWantRadiusCoordinates: Coordinates = {
        latitude: 46.763706658731444,
        longitude: -71.30189913239369,
      };

      const offerOutsideWantRadius: Offer = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'All Pizzas 70% OFF!',
        description: 'The Manager has gone crazy! All pizzas 70% OFF!',
        categories: ['pizza', 'italian', 'food'],
        center: {
          latitude: offerOutsideWantRadiusCoordinates.latitude,
          longitude: offerOutsideWantRadiusCoordinates.longitude,
          geohash: geofire.geohashForLocation([
            offerOutsideWantRadiusCoordinates.latitude,
            offerOutsideWantRadiusCoordinates.longitude,
          ]),
        },
        radiusInMeters: 10000,
      };

      const allOffers = [
        offerInWantRadiusAndWantInOwnRadius,
        anotherOfferInWantRadiusAndWantInOwnRadius,
        offerInWantRadiusButOutsideOwnRadius,
        offerOutsideWantRadius,
      ];
      for (const offer of allOffers) {
        const { id: offerId, ...offerData } = offer;
        await db.doc(`${offersCollectionPath}/${offerId}`).set(offerData);
      }

      jest.spyOn(wantsService, 'getWantById').mockResolvedValueOnce(want);

      const expectedResult = [offerInWantRadiusAndWantInOwnRadius, anotherOfferInWantRadiusAndWantInOwnRadius];

      const result = await offersService.listOffersByWantId(want.id);

      expect(result).toStrictEqual(expectedResult);
    });

    it('given Want does not exist then should throw not found', async () => {
      const wantId = faker.datatype.uuid();

      const expectedError = new AppError(CommonErrors.NotFound, `Want ${wantId} not found`)

      jest.spyOn(wantsService, 'getWantById').mockResolvedValueOnce(undefined);

      await expect(offersService.listOffersByWantId(wantId)).rejects.toThrow(expectedError)

    })
  });

  describe('deleteOfferById', () => {
    it('should delete an Offer', async () => {
      const offer: Offer = {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        title: 'All for $20! Haircut, manicure, and pedicure',
        categories: ['haircut', 'sallon', 'manicure', 'pedicure', 'beauty'],
        center: getRandomCenter(),
        radiusInMeters: faker.datatype.number(),
      };

      const { id, ...wantData } = offer;

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
