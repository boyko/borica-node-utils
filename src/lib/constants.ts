export type BoricaTransactionType =
  | '10' // Авторизация
  | '11' // Изплащане на печалба
  | '21' // Заявка за отложена авторизация
  | '22' // Изпълнение на отложена авторизация
  | '23' // Отмяна(Reversal) на транзакция 21
  | '40' // Връщане на сума (Reversal)
  | '41' // Връщане на изплатена печалба

export type BoricaResponseType =
  '00'
  | '85'
  | '86'
  | '87'
  | '88'
  | '89'
  | '90'
  | '91'
  | '92'
  | '93'
  | '94'
  | '95'
  | '96'
  | '97'
  | '98'
  | '99'

export interface BoricaTransactionCodes {
  AUTHORIZATION: '10',
  PROFIT_PAYOUT: '11',
  AUTHORIZATION_DELAYED_REQUEST: '21',
  AUTHORIZATION_DELAYED_COMPLETE: '22',
  REVERSAL_DELAYED_AUTHORIZATION: '23',
  REVERSAL: '40',
  REVERSAL_PROFIT: '41'
};

export const BORICA_TRANSACTION_CODES: BoricaTransactionCodes = {
  AUTHORIZATION: '10',
  PROFIT_PAYOUT: '11',
  AUTHORIZATION_DELAYED_REQUEST: '21',
  AUTHORIZATION_DELAYED_COMPLETE: '22',
  REVERSAL_DELAYED_AUTHORIZATION: '23',
  REVERSAL: '40',
  REVERSAL_PROFIT: '41'
};

export type BoricaTransactionUrlType =
  'transactionStatusReport'
  | 'manageTransaction'
  | 'registerTransaction'

export interface BoricaTransactionUrls {
  STATUS: 'transactionStatusReport',
  MANAGE: 'manageTransaction',
  REGISTER: 'registerTransaction'
}

export const BORICA_TRANSACTION_URLS: BoricaTransactionUrls = {
  STATUS: 'transactionStatusReport',
  MANAGE: 'manageTransaction',
  REGISTER: 'registerTransaction'
};

export interface BoricaResponseCodes {
  SUCCESS: '00',
  REVERSAL_DUPLICATE: '85',
  TRANSACTION_DUPLICATE: '86',
  PROTOCOL_WRONG_VERSION: '87',
  BOREQ_NOT_SUBMITTED: '88',
  TRANSACTION_NOT_FOUND: '89',
  CARD_NOT_REGISTERED: '90',
  TIMEOUT: '91',
  FORMAT_INVALID: '92',
  AUTHENTICATION_ERROR: '93',
  CANCELLED: '94',
  SIGNATURE_INVALID: '95',
  BADREQUEST: '96',
  FRAUD: '97',
  BORESP_NOT_FOUND: '98',
  TPSS_REJECTED: '99'
};

export const BORICA_RESPONSE_CODES: BoricaResponseCodes = {
  SUCCESS: '00',
  REVERSAL_DUPLICATE: '85',
  TRANSACTION_DUPLICATE: '86',
  PROTOCOL_WRONG_VERSION: '87',
  BOREQ_NOT_SUBMITTED: '88',
  TRANSACTION_NOT_FOUND: '89',
  CARD_NOT_REGISTERED: '90',
  TIMEOUT: '91',
  FORMAT_INVALID: '92',
  AUTHENTICATION_ERROR: '93',
  CANCELLED: '94',
  SIGNATURE_INVALID: '95',
  BADREQUEST: '96',
  FRAUD: '97',
  BORESP_NOT_FOUND: '98',
  TPSS_REJECTED: '99'
};

export type BoricaLanguageType =
  'BG'
  | 'EN'
  | 'EL'
  | 'MK'
  | 'PL'
  | 'RO'
  | 'SR'
  | 'TR'

export type BoricaProtocolVersionType = '1.0' | '1.1' | '2.0'
export const BORICA_PROTOCOL_VERSIONS: BoricaProtocolVersionType[] = ['1.0', '1.1', '2.0'];
export const BORICA_PROTOCOL_VERSION_DEFAULT = BORICA_PROTOCOL_VERSIONS[0];
export const BORICA_GATEAWAY_URL = 'https://gate.borica.bg/boreps/';
export const BORICA_GATEAWAY_URL_TEST = 'https://gatet.borica.bg/boreps/';
export const BORICA_LANGUAGES: BoricaLanguageType[] = ['BG', 'EN', 'EL', 'MK', 'PL', 'RO', 'SR', 'TR'];
export const BORICA_LANGUAGE_DEFAULT: BoricaLanguageType = 'BG';

export interface BoricaResponseData {
  transactionCode: string;
  transactionTime: string;
  amount: number;
  terminalId: string;
  orderId: string;
  responseCode: string;
  protocolVersion: string;
}

export interface BoricaValidatedResponseData extends BoricaResponseData {
  isValid: boolean;
}
