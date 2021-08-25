import {Request, Response, NextFunction} from 'express';
import faker from 'faker';
import {authenticateJwt} from '../authenticate-jwt';
import * as testUtils from '../../utils/test/test-utils';
import {AppError, CommonErrors} from '../../../error-management/errors';

describe('authenticate-jwt', () => {
  it('given idToken in the authorization header and the token is verified then should add the uid to the req', async () => {
    const uid = faker.datatype.uuid();
    const token = await testUtils.getIdToken(uid);

    const req: Partial<Request> = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res: Partial<Response> = {};
    const next: NextFunction = jest.fn();

    await authenticateJwt(req as Request, res as Response, next);

    expect(req.uid).toBe(uid);
    expect(next).toBeCalledWith();
  });

  it('given no authorization header then should call next with Unauthorized', async () => {
    const req: Partial<Request> = {headers: {}};
    const res: Partial<Response> = {};
    const next: NextFunction = jest.fn();

    const expectedError = new AppError(
      CommonErrors.Unauthorized,
      'Unauthorized'
    );

    await authenticateJwt(req as Request, res as Response, next);

    expect(next).toBeCalledWith(expectedError);
  });

  it('given invalid authorization header then should call next with Forbidden', async () => {
    const req: Partial<Request> = {headers: {authorization: 'Bearer invalid'}};
    const res: Partial<Response> = {};
    const next: NextFunction = jest.fn();

    const expectedError = new AppError(CommonErrors.Forbidden, 'Forbidden');

    await authenticateJwt(req as Request, res as Response, next);

    expect(next).toBeCalledWith(expectedError);
  });
});
