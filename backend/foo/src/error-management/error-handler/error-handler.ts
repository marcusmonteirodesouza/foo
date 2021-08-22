import {isCelebrateError} from 'celebrate';
import {Response} from 'express';
import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import {logger} from '../../logger';
import {AppError, CommonErrors} from '../errors';
import {ErrorResponse} from './error-response';

class ErrorHandler {
  handleError(error: Error, res: Response) {
    logger.error(error);

    if (isCelebrateError(error)) {
      const errorMessage = Array.from(error.details.entries())
        .map(entry => entry[1].message)
        .join('\n');

      logger.error(errorMessage);

      const response = this.makeErrorResponse(
        ReasonPhrases.BAD_REQUEST,
        errorMessage
      );

      res.status(StatusCodes.BAD_REQUEST).json(response);
    } else if (error instanceof AppError) {
      let response: ErrorResponse;

      switch (error.commonError) {
        case CommonErrors.Forbidden:
          response = this.makeErrorResponse(
            ReasonPhrases.FORBIDDEN,
            error.message
          );
          res.status(StatusCodes.FORBIDDEN).json(response);
          return;

        case CommonErrors.NotFound:
          response = this.makeErrorResponse(
            ReasonPhrases.NOT_FOUND,
            error.message
          );
          res.status(StatusCodes.NOT_FOUND).json(response);
          return;

        case CommonErrors.Unauthorized:
          response = this.makeErrorResponse(
            ReasonPhrases.UNAUTHORIZED,
            error.message
          );
          res.status(StatusCodes.UNAUTHORIZED).json(response);
          return;
      }
    } else {
      const response = this.makeErrorResponse(
        ReasonPhrases.INTERNAL_SERVER_ERROR,
        'Something went wrong'
      );

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  private makeErrorResponse(
    code: ReasonPhrases,
    message: string
  ): ErrorResponse {
    return {
      error: {
        code,
        message,
      },
    };
  }
}

const errorHandler = new ErrorHandler();

export {errorHandler};
