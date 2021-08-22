import {Request, Response, NextFunction} from 'express';
import {ReasonPhrases} from 'http-status-codes';
import {AppError, CommonErrors} from '../../error-management/errors';
import {app} from '../../firebase';
import {logger} from '../../logger';

export async function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {authorization} = req.headers;

  if (authorization) {
    const token = authorization.split(' ')[1];

    try {
      const decodedToken = await app.auth().verifyIdToken(token);
      req.uid = decodedToken.uid;
      next();
    } catch (err) {
      logger.error(err);
      next(new AppError(CommonErrors.Forbidden, ReasonPhrases.FORBIDDEN));
    }
  } else {
    next(new AppError(CommonErrors.Unauthorized, ReasonPhrases.UNAUTHORIZED));
  }
}
