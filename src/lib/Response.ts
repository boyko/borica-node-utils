import {
  BORICA_RESPONSE_CODES, BORICA_TRANSACTION_CODES, BoricaValidatedResponseData
} from './constants';

export default class Response {
  public readonly data: BoricaValidatedResponseData;

  constructor(data: BoricaValidatedResponseData) {
    this.data = data;
  }

  public isSuccessful(): boolean {
    return this.data.responseCode === BORICA_RESPONSE_CODES.SUCCESS;
  }

  public isRegisterTransaction(): boolean {
    return this.data.transactionCode === BORICA_TRANSACTION_CODES.AUTHORIZATION;
  }

  public isDelayedAuthorizationRequest(): boolean {
    return this.data.transactionCode === BORICA_TRANSACTION_CODES.AUTHORIZATION_DELAYED_REQUEST;
  }

  public isDelayedAuthorizationComplete(): boolean {
    return this.data.transactionCode === BORICA_TRANSACTION_CODES.AUTHORIZATION_DELAYED_COMPLETE;
  }

  public isDelayedAuthorizationReversal(): boolean {
    return this.data.transactionCode === BORICA_TRANSACTION_CODES.REVERSAL_DELAYED_AUTHORIZATION;
  }

  public isReversal(): boolean {
    return this.data.transactionCode === BORICA_TRANSACTION_CODES.REVERSAL;
  }

  public toJSON(): BoricaValidatedResponseData {
    return {
      ...this.data
    };
  }
}
