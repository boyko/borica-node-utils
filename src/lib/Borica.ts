import crypto from 'crypto';
import {
  BORICA_LANGUAGE_DEFAULT, BORICA_PROTOCOL_VERSION_DEFAULT,
  BORICA_TRANSACTION_CODES,
  BORICA_TRANSACTION_URLS,
  BoricaLanguageType,
  BoricaProtocolVersionType,
  BoricaResponseData,
  BoricaValidatedResponseData
} from './constants';
import { formatDateYMDHS, pad } from './utils';

export interface BoricaMessageData {
  orderId: string;
  amount: number;
  description: string;
  currency: string;
  language?: BoricaLanguageType;
  date?: Date
}

export interface BoricaConfig {
  privateKey: string;
  publicKey: string;
  terminalId: string;
  gatewayUrl: string;
  protocolVersion?: BoricaProtocolVersionType;
  languageCode?: BoricaLanguageType
}

export default class Borica implements BoricaConfig {
  terminalId: string;
  privateKey: string;
  publicKey: string;
  protocolVersion: BoricaProtocolVersionType;
  languageCode: BoricaLanguageType;
  gatewayUrl: string;

  constructor({ terminalId, privateKey, publicKey, protocolVersion = BORICA_PROTOCOL_VERSION_DEFAULT, languageCode = BORICA_LANGUAGE_DEFAULT, gatewayUrl }: BoricaConfig) {
    this.terminalId = terminalId;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.protocolVersion = protocolVersion;
    this.languageCode = languageCode;
    this.gatewayUrl = gatewayUrl;
  }

  getRegisterTransactionURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.AUTHORIZATION, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.REGISTER);
  }

  getStatusURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.AUTHORIZATION, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.STATUS);
  }

  getRegisterDelayedRequestURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.AUTHORIZATION_DELAYED_REQUEST, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.REGISTER);
  }

  getCompleteDelayedRequestURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.AUTHORIZATION_DELAYED_COMPLETE, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.MANAGE);
  }

  getReverseDelayedRequestURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.REVERSAL_DELAYED_AUTHORIZATION, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.MANAGE);
  }

  getReverseURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.REVERSAL, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.MANAGE);
  }

  getPayProfitURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.PROFIT_PAYOUT, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.REGISTER);
  }

  getPayedProfitReversalURL(data: BoricaMessageData): string {
    const message = this._getBaseMessage(BORICA_TRANSACTION_CODES.REVERSAL_PROFIT, data);
    return this._generateURL(message, BORICA_TRANSACTION_URLS.MANAGE);
  }

  _getBaseMessage(messageType: string, data: BoricaMessageData): string {
    return (
      messageType +
      formatDateYMDHS(data.date || new Date()) +
      this._processTransactionAmount(data.amount) +
      this.terminalId +
      pad(data.orderId, 15, ' ', 'right') +
      pad(data.description, 125, ' ', 'right') +
      this.languageCode +
      this.protocolVersion
    );
  }

  _generateURL(message: string, type: string): string {
    const signedMessage = this._signMessage(message);
    const finalMessage = encodeURIComponent(signedMessage.toString('base64'));
    return `${this.gatewayUrl}${type}?eBorica=${finalMessage}`;
  }

  _signMessage(message: string): Buffer {
    const privateKey = this.privateKey;
    const sign = crypto.createSign('SHA1');
    sign.update(message);
    sign.end();
    const signature = sign.sign(Buffer.from(privateKey));
    return Buffer.concat([Buffer.from(message), Buffer.from(signature)]);
  }

  _processTransactionAmount(value: number): string {
    return pad(value, 12);
  }

  _hasValidSignature(data: string, signature: Buffer): boolean {
    const verify = crypto.createVerify('SHA1');
    verify.update(data);
    verify.end();

    return verify.verify(this.publicKey, signature);
  }

  parseResponse(message: string): BoricaValidatedResponseData {
    const decodedMessage = Buffer.from(decodeURIComponent(message), 'base64');
    const messageBase64 = decodedMessage.toString();
    const signatureBuffer = decodedMessage.slice(56);
    const data = messageBase64.substring(0, 56);
    const isValid = this._hasValidSignature(data, signatureBuffer);

    const parsedData = this._parseResponseMessageData(messageBase64);
    return {
      ...parsedData,
      isValid
    };
  }

  _parseResponseMessageData(msg: string): BoricaResponseData {
    return {
      transactionCode: msg.substring(0, 2),
      transactionTime: msg.substring(2, 16),
      amount: parseInt(msg.substring(16, 28).trim(), 10),
      terminalId: msg.substring(28, 36),
      orderId: msg.substring(36, 51).trim(),
      responseCode: msg.substring(51, 53),
      protocolVersion: msg.substring(53, 56)
    };
  }

  // handleError() {
  //   switch (this.responseCode) {
  //     case "03":
  //       return "The Merchant Category Code (DE 018) is not valid for the defined processing Code (DE  003).";
  //     case "04":
  //       return "The acquirer should instruct the merchant to retain the card. No specific reason given.";
  //     case "05":
  //       return "Transaction declined. No specific reason given";
  //     case "06":
  //       return "Indicates an unspecified error in a previousmessage. When used in a 0420 reversal,indicates that the reason for the reversal wasdue to an error in a previous message";
  //     case "13":
  //       return "Invalid amount";
  //     case "14":
  //       return "Invalid card number (no such number)";
  //     case "15":
  //       return "Unable to route at IEM";
  //     case "17":
  //       return "Customer cancellation";
  //     case "80":
  //       return "Issuer sign-off";
  //     case "33":
  //       return "Expired card";
  //     case "36":
  //       return "Restricted card";
  //     case "37":
  //       return "Card acceptor call acquirer security";
  //     case "41":
  //       return "Lost card";
  //     case "43":
  //       return "Stolen card";
  //     case "51":
  //       return "Not sufficient funds";
  //     case "54":
  //       return "Expired card";
  //     case "57":
  //       return "Transaction not permitted to cardholder";
  //     case "58":
  //       return "Transaction not permitted to terminal";
  //     case "61":
  //       return "Exceeds withdrawal amount limit";
  //     case "62":
  //       return "Restricted card";
  //     case "65":
  //       return "Exceeds withdrawal frequency limit";
  //     case "66":
  //       return "Card acceptor call acquirer security department";
  //     case "85":
  //       return "Transaction from type Reversal with same parameters is already registered.";
  //     case "86":
  //       return "Transaction with the same parameters is already registered.";
  //     case "87":
  //       return "Wrong protocol version";
  //     case "88":
  //       return "For managing transactions. No parameter BOReq in request";
  //     case "89":
  //       return "No primary transaction on which to execute this second one";
  //     case "90":
  //       return "Card is not registered in Directory server";
  //     case "91":
  //       return "Timeout from authorization service";
  //     case "92":
  //       return "Executing check of transaction status. eBorica parameter is in wrong format";
  //     case "93":
  //       return "Unsuccessful 3D authentication from ACS";
  //     case "94":
  //       return "Discarded transaction";
  //     case "95":
  //       return "Invalid signature of merchant";
  //     case "96":
  //       return "Techinical error when processing the transaction";
  //     case "97":
  //       return "Declined by fraud check";
  //     case "98":
  //       return "Executing check of transaction status. For the send BOReq there is no registered BOResp inside of Borica";
  //     case "99":
  //       return "Authorization declined by TPSS";
  //     default:
  //       return "Unknown rror occurred";
  //   }
  // }
}
