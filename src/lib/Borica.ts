import crypto from "crypto";
import {
  BORICA_LANGUAGE_DEFAULT, BORICA_PROTOCOL_VERSION_DEFAULT,
  BORICA_TRANSACTION_CODES,
  BORICA_TRANSACTION_URLS,
  ORDER_FIELD_LENGTH,
  DESCRIPTION_FIELD_LENGTH,
  BoricaLanguageType,
  BoricaProtocolVersionType,
  BoricaResponseData,
  BORICA_LANGUAGES, BORICA_PROTOCOL_VERSIONS
} from "./constants";
import { formatDateYMDHS, pad } from "./utils";

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
    if (BORICA_PROTOCOL_VERSIONS.indexOf(protocolVersion) === -1) {
      throw new Error(`Invalid protocol version: ${languageCode}. Should be one of ${BORICA_PROTOCOL_VERSIONS.join(", ")}`);
    }
    this.protocolVersion = protocolVersion;
    if (BORICA_LANGUAGES.indexOf(languageCode) === -1) {
      throw new Error(`Invalid language code: ${languageCode}. Should be one of ${BORICA_LANGUAGES.join(", ")}`);
    }
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
      this._processOrderId(data.orderId) +
      this._processDescription(data.description) +
      this.languageCode +
      this.protocolVersion
    );
  }

  _processDescription(desc: string): string {
    if (desc.length > DESCRIPTION_FIELD_LENGTH) {
      throw new Error(`Invalid description field: ${desc}. Description field should be shorter than ${DESCRIPTION_FIELD_LENGTH} characters.`);
    }
    return pad(desc, 125, " ", "right");
  }

  _processOrderId(orderId: string): string {
    if (orderId.length > ORDER_FIELD_LENGTH) {
      throw new Error(`Invalid orderId: ${orderId}. Order field should be shorter than ${ORDER_FIELD_LENGTH} characters.`);
    }
    return pad(orderId, 15, " ", "right");
  }

  _generateURL(message: string, type: string): string {
    const signedMessage = this._signMessage(message);
    const finalMessage = encodeURIComponent(signedMessage.toString("base64"));
    return `${this.gatewayUrl}${type}?eBorica=${finalMessage}`;
  }

  _signMessage(message: string): Buffer {
    const privateKey = this.privateKey;
    const sign = crypto.createSign("SHA1");
    sign.update(message);
    sign.end();
    const signature = sign.sign(Buffer.from(privateKey));
    return Buffer.concat([Buffer.from(message), Buffer.from(signature)]);
  }

  _processTransactionAmount(value: number): string {
    if (!Number.isInteger(value)) {
      throw new Error(`Invalid amount: ${value}. Amount should be an integer value (cents, stotinki, etc.).`)
    }
    return pad(value, 12);
  }

  _hasValidSignature(data: string, signature: Buffer): boolean {
    const verify = crypto.createVerify("SHA1");
    verify.update(data);
    verify.end();

    return verify.verify(this.publicKey, signature);
  }

  parseResponse(message: string): BoricaResponseData | null {
    const decodedMessage = Buffer.from(decodeURIComponent(message), "base64");
    const messageBase64 = decodedMessage.toString();
    const signatureBuffer = decodedMessage.slice(56);
    const data = messageBase64.substring(0, 56);
    const isValid = this._hasValidSignature(data, signatureBuffer);
    return isValid ? this._parseResponseMessageData(messageBase64) : null;
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
}
