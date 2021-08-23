import {Router} from 'express';
import {celebrate, Joi, Segments} from 'celebrate';
import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import {authenticateJwt} from '../auth/middleware';
import {usersService} from '../users';
import * as wantsService from './wants-service';
import {CreateWantRequest, CreateWantResponse} from './dto';
import {logger} from '../logger';
import {AppError, CommonErrors} from '../error-management/errors';

const router = Router();

router.post(
  '/wants',
  authenticateJwt,
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      center: Joi.object().keys({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      }),
      radius: Joi.number().required(),
    }),
  }),
  async (req, res, next) => {
    try {
      const user = await usersService.getOrCreateUser({uid: req.uid});

      const request = req.body as CreateWantRequest;

      const want = await wantsService.createWant(user.id, {
        title: request.title,
        center: request.center,
        radius: request.radius,
      });

      const response: CreateWantResponse = {
        id: want.id,
      };

      res.status(StatusCodes.CREATED).json(response);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/wants', authenticateJwt, async (req, res, next) => {
  try {
    const user = await usersService.getOrCreateUser({uid: req.uid});

    const wants = await wantsService.listWantsByUserId(user.id);

    res.json(wants);
  } catch (err) {
    next(err);
  }
});

router.delete('/wants/:id', authenticateJwt, async (req, res, next) => {
  try {
    const {id} = req.params;

    const user = await usersService.getOrCreateUser({uid: req.uid});

    const want = await wantsService.getWant(id);

    if (user.id !== want.userId) {
      logger.error(`User ${user.id} not allowed to delete want ${want.id}`);
      throw new AppError(CommonErrors.Forbidden, ReasonPhrases.FORBIDDEN);
    }

    await wantsService.deleteWant(want.id);

    res.status(StatusCodes.NO_CONTENT).json();
  } catch (err) {
    next(err);
  }
});

export {router};
