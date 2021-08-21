import express from 'express';
import {router as offersRouter} from './offers';

const app = express();

app.use(express.json());

app.use(offersRouter);

export {app};
