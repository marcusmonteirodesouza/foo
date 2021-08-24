import {Router} from 'express';
import {celebrate, Joi, Segments} from 'celebrate';
import {usersService} from '../users';
import * as offersService from './offers-service';
import {CreateOfferRequest, CreateOfferResponse} from './dto';
import {authenticateJwt} from '../auth/middleware';
import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import {AppError, CommonErrors} from '../error-management/errors';
import {logger} from '../logger';

const router = Router();

router.post(
  '/offers',
  celebrate({
    [Segments.HEADERS]: Joi.object()
      .keys({
        authorization: Joi.string(),
      })
      .unknown(),
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string(),
      categories: Joi.array().items(Joi.string()),
      center: Joi.object().keys({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      }),
      radius: Joi.number().required(),
    }),
  }),
  authenticateJwt,
  async (req, res, next) => {
    try {
      const user = await usersService.getOrCreateUser({uid: req.uid});

      const request = req.body as CreateOfferRequest;

      const offer = await offersService.createOffer(user.id, {
        title: request.title,
        description: request.description,
        categories: request.categories,
        center: request.center,
        radius: request.radius,
      });

      const response: CreateOfferResponse = {
        id: offer.id,
      };

      res.status(StatusCodes.CREATED).json(response);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/offers',
  celebrate({
    [Segments.HEADERS]: Joi.object()
      .keys({
        authorization: Joi.string(),
      })
      .unknown(),
  }),
  authenticateJwt,
  async (req, res, next) => {
    try {
      const user = await usersService.getOrCreateUser({uid: req.uid});

      const offers = await offersService.listOffersByUserId(user.id);

      res.json(offers);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/offers/:id',
  celebrate({
    [Segments.HEADERS]: Joi.object()
      .keys({
        authorization: Joi.string(),
      })
      .unknown(),
  }),
  authenticateJwt,
  async (req, res, next) => {
    try {
      const {id} = req.params;

      const user = await usersService.getOrCreateUser({uid: req.uid});

      const offer = await offersService.getOfferById(id);

      if (user.id !== offer.userId) {
        logger.error(`User ${user.id} not allowed to delete offer ${offer.id}`);
        throw new AppError(CommonErrors.Forbidden, ReasonPhrases.FORBIDDEN);
      }

      await offersService.deleteOfferById(offer.id);

      res.status(StatusCodes.NO_CONTENT).json();
    } catch (err) {
      next(err);
    }
  }
);

export {router};
