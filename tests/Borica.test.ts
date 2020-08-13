import crypto from 'crypto';
import Mockdate from 'mockdate';
import Borica, { BoricaConfig, BoricaMessageData } from '../src';
import { BoricaResponseData } from '../src/lib/constants';
import { formatDateYMDHS, pad } from '../src/lib/utils';

const privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIICXgIBAAKBgQDKbixy37tve8Vejzknw2eKbhcLX9As751QRZuUKk5Sqw08rUp6\n' +
  'gJm/hhL8XQ92JxiLFttFgpUNZEvDDXeKpafr89UCGedkKsCMs/+gZE+lP5IjZlGz\n' +
  '/RElLLGIPpgB4/3SGJdiGX7ZgX3kV+Nc95HBbNW92v+taUqQVmB7cAmaKQIDAQAB\n' +
  'AoGBAJlE4+iyV8OoTh8ziA4AWKQqiM425HMxlcXSfmKnyZe0JZiciLjKKB8oT7W+\n' +
  'bFeEcIPXcXxmy55RIz/zMWDL3qBhL1Y2wDPw2j5fLN4yOBqBH8bRRugtuL+R0QfL\n' +
  'rTCVoD8pZBGkDUQDpdZbCT80sR1ZfBAnd7Z00z7C5GS+k3GRAkEA+rslgwhVhr58\n' +
  'VSeTD2g2+zWBbRpK4uiXQsUjJ5CCmrtdW435JWq06xtD2gczHuyzO7TymHYa7Nn+\n' +
  'nH/geFLwVQJBAM6vL04JvscETUWFlkZGwxoqAGUqwL86w7XDArJulHhszZSBcQrT\n' +
  'Xrh/f0xxZ6MfXgf4xtNUEUioyPVxkAfNxoUCQQDu+XDHcyoRQ309rHp+NNYymMzD\n' +
  'MEwv+YAyI7NeAl55HBvfJ3JQN2Q4scP6CuKuluw9/Dk9F1SSazRB9Z/9DxABAkEA\n' +
  'oMxEZldImHctUtgyaKxm37Urp4mSeXRTjNaSA5XqZqJncpEeDEkT2UBAHo3gDlW6\n' +
  'B0OyE/nElJ3T8riOULP0LQJAduojvJndSmPLGhe5l/o2Vg3cHLxTscCANwCHUJoT\n' +
  'fN/ZYXOF5JHH9czxkXiCgL2ikjuwsBye2MeFwN89dCSkiA==\n' +
  '-----END RSA PRIVATE KEY-----';

const publicKey = '-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDKbixy37tve8Vejzknw2eKbhcL\n' +
  'X9As751QRZuUKk5Sqw08rUp6gJm/hhL8XQ92JxiLFttFgpUNZEvDDXeKpafr89UC\n' +
  'GedkKsCMs/+gZE+lP5IjZlGz/RElLLGIPpgB4/3SGJdiGX7ZgX3kV+Nc95HBbNW9\n' +
  '2v+taUqQVmB7cAmaKQIDAQAB\n' +
  '-----END PUBLIC KEY-----\n';

const boricaHost = 'borica-gateway';
const terminalId = '11111111';

const createConfigFixture = (opts: Partial<BoricaConfig> = {}): BoricaConfig => {
  return {
    terminalId,
    protocolVersion: '1.0',
    languageCode: 'BG',
    gatewayUrl: `https://${boricaHost}/`,
    privateKey,
    publicKey,
    ...opts
  };
};

function verifyBoreq(message: string): boolean {
  const dataEndPost = 181;
  const messageBuffer = Buffer.from(decodeURIComponent(message), 'base64');
  const data = messageBuffer.slice(0, dataEndPost).toString();
  const signatureBuffer = messageBuffer.slice(dataEndPost);

  const verify = crypto.createVerify('SHA1');
  verify.update(data);
  verify.end();

  return verify.verify(publicKey, signatureBuffer);
}

const createDataFixture = (opts: Partial<BoricaMessageData> = {}): BoricaMessageData => {
  return {
    amount: 10000,
    orderId: 'some-order-id',
    description: 'some-descr',
    currency: 'BGN',
    language: 'BG',
    ...opts
  };
};

function validateBoreqUrl(url: string, path: string): void {
  const _url = new URL(url);
  expect(_url.hostname).toEqual(boricaHost);
  expect(_url.protocol).toEqual('https:');
  expect(_url.pathname).toEqual(`/${path}`);
  const BOReq = getBoricaParam(_url);
  expect(BOReq).toEqual(expect.any(String));
  const isValid = verifyBoreq(BOReq as string);
  expect(isValid).toBe(true);
}

function getBoricaParam(url: URL): string {
  return url.searchParams.get('eBorica') as string;
}

function createResponseFixture(opts: Partial<BoricaResponseData> = {}): BoricaResponseData {
  const data = {
    orderId: 'some-order-id',
    transactionCode: '10',
    transactionTime: formatDateYMDHS(new Date()),
    amount: 10000,
    terminalId,
    responseCode: '00',
    protocolVersion: '1.0',
    ...opts
  };

  return data;
}

function createBoresFixture(data: BoricaResponseData): string {
  const dataString = data.transactionCode + data.transactionTime + pad(data.amount, 12, ' ', 'right') + data.terminalId + pad(data.orderId, 15, ' ', 'right') + data.responseCode + data.protocolVersion;
  const sign = crypto.createSign('SHA1');
  sign.update(dataString);
  sign.end();
  const signature = sign.sign(Buffer.from(privateKey));
  return encodeURIComponent(Buffer.concat([Buffer.from(dataString), Buffer.from(signature)]).toString('base64'));
}

describe('Borica', () => {
  // @ts-ignore
  let borica: Borica;
  // @ts-ignore
  let data: BoricaMessageData;
  let config: BoricaConfig;
  // @ts-ignore
  let response: string;
  // @ts-ignore
  let responseData: BoricaResponseData;

  beforeAll(() => {
    Mockdate.set(new Date(2018, 3, 15, 12, 18, 0, 0));
  });
  afterAll(() => {
    Mockdate.reset();
  });
  beforeEach(() => {
    data = createDataFixture();
    config = createConfigFixture();
    responseData = createResponseFixture();
    response = createBoresFixture(responseData);
    borica = new Borica(config);
  });
  it('should set configuration', () => {
    expect(borica).toHaveProperty('terminalId', config.terminalId);
    expect(borica).toHaveProperty('privateKey', config.privateKey);
    expect(borica).toHaveProperty('publicKey', config.publicKey);
    expect(borica).toHaveProperty('protocolVersion', config.protocolVersion);
    expect(borica).toHaveProperty('languageCode', config.languageCode);
    expect(borica).toHaveProperty('gatewayUrl', config.gatewayUrl);
  });

  describe('getRegisterTransactionURL()', () => {
    it('should return a url', () => {
      const result = borica.getRegisterTransactionURL(data);
      validateBoreqUrl(result, 'registerTransaction');
    });
  });
  describe('getStatusURL()', () => {
    it('should return a valid url', () => {
      const result = borica.getStatusURL(data);
      validateBoreqUrl(result, 'transactionStatusReport');
    });
  });
  describe('getRegisterDelayedRequestURL()', () => {
    it('should return a valid url', () => {
      const result = borica.getRegisterDelayedRequestURL(data);
      validateBoreqUrl(result, 'registerTransaction');
    });
  });
  describe('getRegisterDelayedRequestURL()', () => {
    it('should return a valid url', () => {
      const result = borica.getCompleteDelayedRequestURL(data);
      validateBoreqUrl(result, 'manageTransaction');
    });
  });
  describe('getReverseDelayedRequestURL()', () => {
    it('should return a valid url', () => {
      const result = borica.getReverseDelayedRequestURL(data);
      validateBoreqUrl(result, 'manageTransaction');
    });
  });
  describe('getReverseURL()', () => {
    it('should return a valid url', () => {
      const result = borica.getReverseURL(data);
      validateBoreqUrl(result, 'manageTransaction');
    });
  });
  describe('getPayProfitURL()', () => {
    it('should return a valid url', () => {
      const result = borica.getPayProfitURL(data);
      validateBoreqUrl(result, 'registerTransaction');
    });
  });
  describe('getPayedProfitReversalURL()', () => {
    it('should return a valid url', () => {
      const result = borica.getPayedProfitReversalURL(data);
      validateBoreqUrl(result, 'manageTransaction');
    });
  });
  describe('parseResponse()', () => {
    it('should return an object', () => {
      const result = borica.parseResponse(response);
      expect(result).toEqual({
        isValid: true,
        ...responseData
      });
    });
  });
});
