import {Router} from 'express';

const router = Router();

router.get('/offers', (_req, res) => {
  res.json({message: 'Hello, from /offers!'});
});

export {router};
