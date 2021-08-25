import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';
import { User, usersService } from '../../users';
import * as wantsService from '../wants-service';
import { CreateWantRequest } from '../dto';
import { testUtils } from '../../auth/utils/test';
import { Want } from '../want';
import {
  AppError,
  CommonErrors,
  ErrorResponse,
} from '../../error-management/errors';
import { ReasonPhrases } from 'http-status-codes';

describe('wants-router', () => {
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

  describe('POST /wants', () => {
    const url = '/wants';

    const body: CreateWantRequest = {
      title: 'Immigration news',
      categories: ['immigration', 'government', 'Quebec'],
      center: {
        latitude: Number.parseFloat(faker.address.latitude()),
        longitude: Number.parseFloat(faker.address.longitude()),
      },
      radius: 5000,
    };

    it('should create a Want and return it', (done) => {
      const want: Want = {
        id: faker.datatype.uuid(),
        userId: user.id,
        ...body,
      };

      jest.spyOn(usersService, 'getOrCreateUser').mockResolvedValueOnce(user);

      jest.spyOn(wantsService, 'createWant').mockResolvedValueOnce(want);

      request(app)
        .post(url)
        .send(body)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(201)
        .then((response) => {
          expect(response.body).toStrictEqual(want);
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

    it('given createWant throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(wantsService, 'createWant')
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

  describe('GET /wants', () => {
    const url = '/wants';

    const wants: Want[] = [
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

    it("should return the list of the User's Wants", (done) => {
      jest.spyOn(usersService, 'getOrCreateUser').mockResolvedValue(user);

      jest
        .spyOn(wantsService, 'listWantsByUserId')
        .mockResolvedValueOnce(wants);

      request(app)
        .get(url)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toStrictEqual(wants);
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
        .get(url)
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
        .get(url)
        .set('authorization', 'Bearer invalid')
        .expect('content-type', /json/)
        .expect(403)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given the User does not exist then should return not found', (done) => {
      const errorMessage = `User ${user.uid} not found`;

      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.NOT_FOUND,
          message: errorMessage,
        },
      };

      const error = new AppError(CommonErrors.NotFound, errorMessage);

      jest.spyOn(usersService, 'getOrCreateUser').mockRejectedValueOnce(error);

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
        .get(url)
        .set('authorization', authorization)
        .expect('content-type', /json/)
        .expect(500)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given listWantsByUserId throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(wantsService, 'listWantsByUserId')
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

  describe('DELETE /want/:id', () => {
    const want: Want = {
      id: faker.datatype.uuid(),
      userId: user.id,
      title: 'Haircuts near me',
      categories: ['haircut', 'hair', 'sallon', 'beauty'],
      center: {
        latitude: Number.parseFloat(faker.address.latitude()),
        longitude: Number.parseFloat(faker.address.longitude()),
      },
      radius: 1000,
    };

    const url = `/wants/${want.id}`;

    it('should delete a Want by its id', (done) => {
      jest.spyOn(usersService, 'getOrCreateUser').mockResolvedValueOnce(user);

      jest.spyOn(wantsService, 'getWantById').mockResolvedValueOnce(want);

      const deleteWantSpy = jest
        .spyOn(wantsService, 'deleteWantById')
        .mockResolvedValueOnce();

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect(204)
        .then(() => {
          expect(deleteWantSpy).toBeCalledWith(want.id);
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

    it('given the Want is not found then should return not found', (done) => {
      const errorMessage = `Want ${want.id} does not exist`;

      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.NOT_FOUND,
          message: errorMessage,
        },
      };

      const error = new AppError(CommonErrors.NotFound, errorMessage);

      jest.spyOn(wantsService, 'getWantById').mockRejectedValueOnce(error);

      request(app)
        .delete(url)
        .set('authorization', authorization)
        .expect(404)
        .then((response) => {
          expect(response.body).toStrictEqual(expectedResponse);
          done();
        });
    });

    it('given the Want does not belong to the User then should return forbidden', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.FORBIDDEN,
          message: ReasonPhrases.FORBIDDEN,
        },
      };

      jest
        .spyOn(wantsService, 'getWantById')
        .mockResolvedValueOnce({ ...want, userId: faker.datatype.uuid() });

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

    it('given getWantById throws an unexpected Error then should return internal server error', (done) => {
      const expectedResponse: ErrorResponse = {
        error: {
          code: ReasonPhrases.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
      };

      jest
        .spyOn(wantsService, 'getWantById')
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
