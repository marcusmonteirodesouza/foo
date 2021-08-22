import {CommonErrors} from './common-errors';

export class AppError extends Error {
  public readonly commonError: CommonErrors;

  constructor(commonError: CommonErrors, message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

    this.commonError = commonError;
  }
}
