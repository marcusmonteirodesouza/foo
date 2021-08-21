import {ReasonPhrases} from 'http-status-codes';

type ErrorResponse = {
  error: {
    code: ReasonPhrases;
    message: string;
  };
};

export {ErrorResponse};
