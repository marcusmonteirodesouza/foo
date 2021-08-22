import {Router} from 'express';
import {celebrate, Joi, Segments} from 'celebrate';
import {usersService} from '../users';
import * as offersService from './offers-service';
import {CreateOfferRequest, CreateOfferResponse} from './dto';
import {authenticateJwt} from '../auth/middleware';
import {StatusCodes} from 'http-status-codes';

const router = Router();

router.post(
  '/offers',
  authenticateJwt,
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    try {
      const user = await usersService.getOrCreateUser({uid: req.uid});

      const request = req.body as CreateOfferRequest;

      const offer = await offersService.createOffer(user.id, {
        title: request.title,
        description: request.description,
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

export {router};
