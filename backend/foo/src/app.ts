import express, { NextFunction, Request, Response } from 'express';
import { router as offersRouter } from './offers';
import { router as wantsRouter } from './wants';
import { errorHandler } from './error-management/error-handler';

const app = express();

app.use(express.json());

app.use(offersRouter);

app.use(wantsRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  errorHandler.handleError(error, res);
});

export { app };
