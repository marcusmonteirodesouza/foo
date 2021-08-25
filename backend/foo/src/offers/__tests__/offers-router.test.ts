import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import { User, usersService } from '../../users';
import * as offersService from '../offers-service';
import { CreateOfferRequest } from '../dto';
import { testUtils } from '../../auth/utils/test';
import { Offer } from '../offer';
import {
  AppError,
  CommonErrors,
  ErrorResponse,
} from '../../error-management/errors';
import { ReasonPhrases } from 'http-status-codes';

describe('offers-router', () => {
  const user: User = {
    id: faker.datatype.uuid(),
    uid: faker.datatype.uuid(),
  };

  let authorization: string;

  beforeAll(async () => {
    authorization = `Bearer ${await testUtils.getIdToken(user.id)}`;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /offers', () => {
    const url = '/offers';

    const body: CreateOfferRequest = {
      title: 'Immigration news',
      description:
        'Know the latest news on immigration to our beautiful Quebec',
      categories: ['immigration', 'government', 'Quebec'],
      center: {
        latitude: Number.parseFloat(faker.address.latitude()),
        longitude: Number.parseFloat(faker.address.longitude()),
      },
      radius: 5000,
    };

    it('should create a Offer and return it', (done) => {
      const offer: Offer = {
        id: faker.datatype.uuid(),
        userId: user.id,
        ...body,
      };

      jest.spyOn(usersService, 'getOrCreateUser').mockResolvedValueOnce(user);

      jest.spyOn(offersService, 'createOffer').mockResolvedValueOnce(offer);

      request(app)
        .post(url)
        .send(body)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(201)
        .then((response) => {
          expect(response.body).toStrictEqual(offer);
          done();
        });
    });

    it('given no authorization header then should return bad request', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.BAD_REQUEST,
          message: '"authorization" is required',
        },
      };

      request(app)
        .post(url)
        .send(body)
        .expect('content-type', /json/)
        .expect(400)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given invalid authorization header then should return forbidden', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.FORBIDDEN,
          message: ReasonPhrases.FORBIDDEN,
        },
      };

      request(app)
        .post(url)
        .send(body)
        .set('authorization', 'Bearer invalid')
        .expect('content-type', /json/)
        .expect(403)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given the User does not exist then should return not found', (done) => {
      const errorMessage = `User ${user.uid} does not exist`;

      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.NOT_FOUND,
          message: errorMessage,
        },
      };

      const error = new AppError(CommonErrors.NotFound, errorMessage);

      jest.spyOn(usersService, 'getOrCreateUser').mockRejectedValueOnce(error);

      request(app)
        .post(url)
        .send(body)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(404)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given getOrCreateUser throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(usersService, 'getOrCreateUser')
        .mockRejectedValueOnce(new Error('error!'));

      request(app)
        .post(url)
        .send(body)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(500)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given createOffer throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(offersService, 'createOffer')
        .mockRejectedValueOnce(new Error('error!'));

      request(app)
        .post(url)
        .send(body)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(500)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });
  });

  describe('GET /offers/users/:id', () => {
    const url = `/offers/users/${user.id}`;

    const offers: Offer[] = [
      {
        id: faker.datatype.uuid(),
        userId: user.id,
        title: 'Beer promotion',
        categories: ['beer', 'alcohol'],
        center: {
          latitude: Number.parseFloat(faker.address.latitude()),
          longitude: Number.parseFloat(faker.address.longitude()),
        },
        radius: 3000,
      },
    ];

    it("should return the list of the User's offers", (done) => {
      jest
        .spyOn(offersService, 'listOffersByUserId')
        .mockResolvedValueOnce(offers);

      request(app)
        .get(url)
        .expect('content-type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toStrictEqual(offers);
          done();
        });
    });

    it('given the User does not exist then should return not found', (done) => {
      const errorMessage = `User ${user.uid} does not exist`;

      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.NOT_FOUND,
          message: errorMessage,
        },
      };

      const error = new AppError(CommonErrors.NotFound, errorMessage);

      jest.spyOn(offersService, 'listOffersByUserId').mockRejectedValueOnce(error);

      request(app)
        .get(url)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(404)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given listOffersByUserId throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(offersService, 'listOffersByUserId')
        .mockRejectedValueOnce(new Error('error!'));

      request(app)
        .get(url)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(500)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });
  });

  describe('DELETE /offer/:id', () => {
    const offer: Offer = {
      id: faker.datatype.uuid(),
      userId: user.id,
      title: 'Haircut promotion',
      description: 'Cut your hair with 10% off!',
      categories: ['haircut', 'hair', 'sallon', 'beauty'],
      center: {
        latitude: Number.parseFloat(faker.address.latitude()),
        longitude: Number.parseFloat(faker.address.longitude()),
      },
      radius: 1000,
    };

    const url = `/offers/${offer.id}`;

    it('should delete a Offer by its id', (done) => {
      jest.spyOn(usersService, 'getOrCreateUser').mockResolvedValueOnce(user);

      jest.spyOn(offersService, 'getOfferById').mockResolvedValueOnce(offer);

      const deleteofferspy = jest
        .spyOn(offersService, 'deleteOfferById')
        .mockResolvedValueOnce();

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect(204)
        .then(() => {
          expect(deleteofferspy).toBeCalledWith(offer.id);
          done();
        });
    });

    it('given no authorization header then should return bad request', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.BAD_REQUEST,
          message: '"authorization" is required',
        },
      };

      request(app)
        .delete(url)
        .expect('content-type', /json/)
        .expect(400)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given invalid authorization header then should return forbidden', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.FORBIDDEN,
          message: ReasonPhrases.FORBIDDEN,
        },
      };

      request(app)
        .delete(url)
        .set('authorization', 'Bearer invalid')
        .expect('content-type', /json/)
        .expect(403)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given the User is not found then should return not found', (done) => {
      const errorMessage = `User ${user.uid} does not exist`;

      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.NOT_FOUND,
          message: errorMessage,
        },
      };

      const error = new AppError(CommonErrors.NotFound, errorMessage);

      jest.spyOn(usersService, 'getOrCreateUser').mockRejectedValueOnce(error);

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect(404)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given the Offer is not found then should return not found', (done) => {
      const errorMessage = `Offer ${offer.id} does not exist`;

      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.NOT_FOUND,
          message: errorMessage,
        },
      };

      const error = new AppError(CommonErrors.NotFound, errorMessage);

      jest.spyOn(offersService, 'getOfferById').mockRejectedValueOnce(error);

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect(404)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given the Offer does not belong to the User then should return forbidden', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.FORBIDDEN,
          message: ReasonPhrases.FORBIDDEN,
        },
      };

      jest
        .spyOn(offersService, 'getOfferById')
        .mockResolvedValueOnce({ ...offer, userId: faker.datatype.uuid() });

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect(403)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given getOrCreateUser throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(usersService, 'getOrCreateUser')
        .mockRejectedValueOnce(new Error('error!'));

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(500)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given getOfferById throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(offersService, 'getOfferById')
        .mockRejectedValueOnce(new Error('error!'));

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(500)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });
  });
});
