import {Router} from 'express';
import {celebrate, Joi, Segments} from 'celebrate';
import * as offersService from './offers-service';
import {CreateOfferRequest, CreateOfferResponse} from './dto';

const router = Router();

router.post(
  '/offers',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string(),
    }),
  }),
  async (req, res, next) => {
    try {
      const request = req.body as CreateOfferRequest;

      const offer = await offersService.createOffer(
        request.title,
        request.description
      );

      const response: CreateOfferResponse = {
        id: offer.id,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

export {router};
