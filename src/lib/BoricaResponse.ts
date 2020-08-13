import {
  BORICA_RESPONSE_CODES,
  BORICA_TRANSACTION_CODES,
  BoricaResponseData,
} from "./constants";

export const BORICA_ERROR_CODES_MAP: { [k: string]: string } = {
  "03":
    "The Merchant Category Code (DE 018) is not valid for the defined processing Code (DE  003).",
  "04":
    "The acquirer should instruct the merchant to retain the card. No specific reason given.",
  "05": "Transaction declined. No specific reason given",
  "06":
    "Indicates an unspecified error in a previousmessage. When used in a 0420 reversal,indicates that the reason for the reversal wasdue to an error in a previous message",
  "13": "Invalid amount",
  "14": "Invalid card number (no such number)",
  "15": "Unable to route at IEM",
  "17": "Customer cancellation",
  "80": "Issuer sign-off",
  "33": "Expired card",
  "36": "Restricted card",
  "37": "Card acceptor call acquirer security",
  "41": "Lost card",
  "43": "Stolen card",
  "51": "Not sufficient funds",
  "54": "Expired card",
  "57": "Transaction not permitted to cardholder",
  "58": "Transaction not permitted to terminal",
  "61": "Exceeds withdrawal amount limit",
  "62": "Restricted card",
  "65": "Exceeds withdrawal frequency limit",
  "66": "Card acceptor call acquirer security department",
  "85":
    "Transaction from type Reversal with same parameters is already registered.",
  "86": "Transaction with the same parameters is already registered.",
  "87": "Wrong protocol version",
  "88": "For managing transactions. No parameter BOReq in request",
  "89": "No primary transaction on which to execute this second one",
  "90": "Card is not registered in Directory server",
  "91": "Timeout from authorization service",
  "92":
    "Executing check of transaction status. eBorica parameter is in wrong format",
  "93": "Unsuccessful 3D authentication from ACS",
  "94": "Discarded transaction",
  "95": "Invalid signature of merchant",
  "96": "Techinical error when processing the transaction",
  "97": "Declined by fraud check",
  "98":
    "Executing check of transaction status. For the send BOReq there is no registered BOResp inside of Borica",
  "99": "Authorization declined by TPSS",
};

export interface BoricaErrorObj {
  code: string;
  msg: string;
}

export default class BoricaReponse {
  data: BoricaResponseData;

  constructor(data: BoricaResponseData) {
    this.data = data;
  }

  isSuccessful(): boolean {
    return this.data.responseCode === BORICA_RESPONSE_CODES.SUCCESS;
  }

  getError(): null | object {
    return this.isSuccessful() ? null : this._getErrorObj();
  }

  _getErrorObj(): BoricaErrorObj {
    const code = this.data.responseCode;
    const msg = BORICA_ERROR_CODES_MAP.hasOwnProperty(code)
      ? BORICA_ERROR_CODES_MAP[code]
      : "Unexpected error";
    return {
      code,
      msg,
    };
  }

  isDelayedAuthorizationRequest(): boolean {
    return (
      this.data.responseCode ===
      BORICA_TRANSACTION_CODES.AUTHORIZATION_DELAYED_REQUEST
    );
  }

  isDelayedAuthorizationRequestComplete(): boolean {
    return (
      this.data.responseCode ===
      BORICA_TRANSACTION_CODES.AUTHORIZATION_DELAYED_COMPLETE
    );
  }

  isRegisterTransaction(): boolean {
    return this.data.responseCode === BORICA_TRANSACTION_CODES.AUTHORIZATION;
  }

  isReversal(): boolean {
    return this.data.responseCode === BORICA_TRANSACTION_CODES.REVERSAL;
  }

  toJSON(): BoricaResponseData {
    return {
      ...this.data,
    };
  }
}
