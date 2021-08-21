import {isCelebrateError} from 'celebrate';
import {Response} from 'express';
import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import {logger} from '../../logger';
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

      res.status(StatusCodes.BAD_REQUEST);
      res.json(response);
    } else {
      const response = this.makeErrorResponse(
        ReasonPhrases.INTERNAL_SERVER_ERROR,
        'Something went wrong'
      );

      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      res.json(response);
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
