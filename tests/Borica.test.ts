import crypto from "crypto";
import Mockdate from "mockdate";
import Borica from "../src";
import { BoricaConfig, BoricaMessageData } from "../src/lib/Borica";
import { BoricaResponseData } from "../src/lib/constants";
import { formatDateYMDHS, pad } from "../src/lib/utils";
import BoricaRequest from "../src/lib/BoricaRequest";
import { verifyBoreq } from "../src/lib/verifyBoreq";

const privateKey =
  "-----BEGIN RSA PRIVATE KEY-----\n" +
  "MIICXgIBAAKBgQDKbixy37tve8Vejzknw2eKbhcLX9As751QRZuUKk5Sqw08rUp6\n" +
  "gJm/hhL8XQ92JxiLFttFgpUNZEvDDXeKpafr89UCGedkKsCMs/+gZE+lP5IjZlGz\n" +
  "/RElLLGIPpgB4/3SGJdiGX7ZgX3kV+Nc95HBbNW92v+taUqQVmB7cAmaKQIDAQAB\n" +
  "AoGBAJlE4+iyV8OoTh8ziA4AWKQqiM425HMxlcXSfmKnyZe0JZiciLjKKB8oT7W+\n" +
  "bFeEcIPXcXxmy55RIz/zMWDL3qBhL1Y2wDPw2j5fLN4yOBqBH8bRRugtuL+R0QfL\n" +
  "rTCVoD8pZBGkDUQDpdZbCT80sR1ZfBAnd7Z00z7C5GS+k3GRAkEA+rslgwhVhr58\n" +
  "VSeTD2g2+zWBbRpK4uiXQsUjJ5CCmrtdW435JWq06xtD2gczHuyzO7TymHYa7Nn+\n" +
  "nH/geFLwVQJBAM6vL04JvscETUWFlkZGwxoqAGUqwL86w7XDArJulHhszZSBcQrT\n" +
  "Xrh/f0xxZ6MfXgf4xtNUEUioyPVxkAfNxoUCQQDu+XDHcyoRQ309rHp+NNYymMzD\n" +
  "MEwv+YAyI7NeAl55HBvfJ3JQN2Q4scP6CuKuluw9/Dk9F1SSazRB9Z/9DxABAkEA\n" +
  "oMxEZldImHctUtgyaKxm37Urp4mSeXRTjNaSA5XqZqJncpEeDEkT2UBAHo3gDlW6\n" +
  "B0OyE/nElJ3T8riOULP0LQJAduojvJndSmPLGhe5l/o2Vg3cHLxTscCANwCHUJoT\n" +
  "fN/ZYXOF5JHH9czxkXiCgL2ikjuwsBye2MeFwN89dCSkiA==\n" +
  "-----END RSA PRIVATE KEY-----";

const publicKey =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDKbixy37tve8Vejzknw2eKbhcL\n" +
  "X9As751QRZuUKk5Sqw08rUp6gJm/hhL8XQ92JxiLFttFgpUNZEvDDXeKpafr89UC\n" +
  "GedkKsCMs/+gZE+lP5IjZlGz/RElLLGIPpgB4/3SGJdiGX7ZgX3kV+Nc95HBbNW9\n" +
  "2v+taUqQVmB7cAmaKQIDAQAB\n" +
  "-----END PUBLIC KEY-----\n";

const boricaHost = "borica-gateway";
const terminalId = "11111111";

const createConfigFixture = (
  opts: Partial<BoricaConfig> = {}
): BoricaConfig => {
  return {
    terminalId,
    protocolVersion: "1.0",
    languageCode: "BG",
    gatewayUrl: `https://${boricaHost}/`,
    privateKey,
    publicKey,
    ...opts,
  };
};

const createDataFixture = (
  opts: Partial<BoricaMessageData> = {}
): BoricaMessageData => {
  return {
    amount: 10000,
    orderId: "some-order-id",
    description: "some-descr",
    currency: "BGN",
    language: "BG",
    ...opts,
  };
};

function validateBoreqUrl(payload: BoricaRequest, path: string): void {
  const url = payload.toURL();
  const _url = new URL(url);
  expect(_url.hostname).toEqual(boricaHost);
  expect(_url.protocol).toEqual("https:");
  expect(_url.pathname).toEqual(`/${path}`);
  const eBorica = getBoricaParam(_url);
  expect(eBorica).toEqual(expect.any(String));
  const isValid = verifyBoreq(eBorica as string, publicKey);
  expect(isValid).toBe(true);
}

function getBoricaParam(url: URL): string {
  return url.searchParams.get("eBorica") as string;
}

function createResponseFixture(
  opts: Partial<BoricaResponseData> = {}
): BoricaResponseData {
  const data = {
    orderId: "some-order-id",
    transactionCode: "10",
    transactionTime: formatDateYMDHS(new Date()),
    amount: 10000,
    terminalId,
    responseCode: "00",
    protocolVersion: "1.0",
    ...opts,
  };

  return data;
}

function createBoresFixture(data: BoricaResponseData): string {
  const dataString =
    data.transactionCode +
    data.transactionTime +
    pad(data.amount, 12, " ", "right") +
    data.terminalId +
    pad(data.orderId, 15, " ", "right") +
    data.responseCode +
    data.protocolVersion;
  const sign = crypto.createSign("SHA1");
  sign.update(dataString);
  sign.end();
  const signature = sign.sign(Buffer.from(privateKey));
  return encodeURIComponent(
    Buffer.concat([Buffer.from(dataString), Buffer.from(signature)]).toString(
      "base64"
    )
  );
}

describe("Borica", () => {
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
  it("should set configuration", () => {
    expect(borica).toHaveProperty("terminalId", config.terminalId);
    expect(borica).toHaveProperty("privateKey", config.privateKey);
    expect(borica).toHaveProperty("publicKey", config.publicKey);
    expect(borica).toHaveProperty("protocolVersion", config.protocolVersion);
    expect(borica).toHaveProperty("languageCode", config.languageCode);
    expect(borica).toHaveProperty("gatewayUrl", config.gatewayUrl);
  });

  it("should use default language and protocol if not specified", () => {
    const _config = createConfigFixture();
    const { protocolVersion, languageCode, ...nodefaultsConfig } = _config;

    const _borica = new Borica(nodefaultsConfig);
    expect(_borica).toHaveProperty("languageCode", "BG");
    expect(_borica).toHaveProperty("protocolVersion", "1.0");
  });

  // describe("_getBaseMessage()", () => {
  //   it("should return a message for reversal", () => {
  //     const result = borica._getBaseMessage({
  //
  //     })
  //   });
  // });

  describe("getRegisterTransactionURL()", () => {
    it("should return a url", () => {
      const result = borica.getRegisterTransactionPayload(data);
      validateBoreqUrl(result, "registerTransaction");
    });
  });
  describe("getStatusURL()", () => {
    it("should return a valid url", () => {
      const result = borica.getStatusRequest(data);
      validateBoreqUrl(result, "transactionStatusReport");
    });
  });
  describe("getRegisterDelayedRequestURL()", () => {
    it("should return a valid url", () => {
      const result = borica.getRegisterDelayedRequestPayload(data);
      validateBoreqUrl(result, "registerTransaction");
    });
  });
  describe("getRegisterDelayedRequestURL()", () => {
    it("should return a valid url", () => {
      const result = borica.getCompleteDelayedRequestURL(data);
      validateBoreqUrl(result, "manageTransaction");
    });
  });
  describe("getReverseDelayedRequestURL()", () => {
    it("should return a valid url", () => {
      const result = borica.getReverseDelayedRequestURL(data);
      validateBoreqUrl(result, "manageTransaction");
    });
  });
  describe("getReverseURL()", () => {
    it("should return a valid url", () => {
      const result = borica.getReverseURL(data);
      validateBoreqUrl(result, "manageTransaction");
    });
  });
  describe("getPayProfitURL()", () => {
    it("should return a valid url", () => {
      const result = borica.getPayProfitURL(data);
      validateBoreqUrl(result, "registerTransaction");
    });
  });
  describe("getPayedProfitReversalURL()", () => {
    it("should return a valid url", () => {
      const result = borica.getPayedProfitReversalPayload(data);
      validateBoreqUrl(result, "manageTransaction");
    });
  });
  describe("parseResponse()", () => {
    it("should return a response data object if the signature verifies", () => {
      const result = borica.parseResponse(response);
      expect(result).toEqual(responseData);
    });
    it("should return null for unverified signatures", () => {
      const modifiedResponse = "xxx" + response;
      const result = borica.parseResponse(modifiedResponse);
      expect(result).toEqual(null);
    });
    it("should parse a real message", () => {
      const msg =
        "MTAyMDIwMDgxMjIyMTYxODAwMDAwMDAwMDMyNTYyMTYxNjg4MDAwMDA3MjQwNCAgICAgMDAxLjCAbDj6BB9jHLG5g2AzTahJtqlnr0Jq26hOuP5b0uCXP7562DMp4fshq7HR145BeVP8wMdOcPUSoxETvSAnMEIObd820X1LCDPQwiJcAyQNuwMKUVk3Imu4AnajXc/C6lk/H1pOTLKBIkteLPaaUCeZFaLRRz/sPkbd67dY0mIKAg==";
      const _config = createConfigFixture({
        publicKey:
          "-----BEGIN CERTIFICATE-----\nMIIEPjCCAyagAwIBAgIFAIETPncwDQYJKoZIhvcNAQELBQAwgYExCzAJBgNVBAYT\nAkJHMQ4wDAYDVQQIEwVTb2ZpYTEOMAwGA1UEBxMFU29maWExEjAQBgNVBAoTCUJP\nUklDQSBBRDEdMBsGA1UECxMUSW5mb3JtYXRpb24gU2VjdXJpdHkxHzAdBgNVBAMT\nFjNEIFNlY3VyZSBDQSBURVNUIDIwMTgwHhcNMTgwNTEwMTE1MjAwWhcNMjMwNTEw\nMTE1MjAwWjB2MQswCQYDVQQGEwJCRzEOMAwGA1UECBMFU29maWExDjAMBgNVBAcT\nBVNvZmlhMRIwEAYDVQQKEwlCb3JpY2EgQUQxCzAJBgNVBAsTAklUMSYwJAYDVQQD\nEx0zRFMgUGF5bWVudCBHYXRld2F5IFRFU1QgMjAxODCBnzANBgkqhkiG9w0BAQEF\nAAOBjQAwgYkCgYEA1jQfMh/I9lMtSrzpKXpjN8HKzTTzLGQk51K/pHjc5E0Mc0+o\nXVA4jRU+m8mGm1uf5QG0KCduV58eAAHZCOPmc6rTlBedxc67N87Fet3y776jsosq\nvNHHO7aPFppz53bq7hFXAdlRJeuiozeQ9JO/WKyE8mCTYZmq6RSVOyYv1ZkCAwEA\nAaOCAUkwggFFMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFN0KMCcvMiCn/X9yoUif\nqUqJgTzlMIGYBgNVHSMEgZAwgY2AFDLa4X6v1PDo/5JwYAgbHbUDWVROoW6kbDBq\nMQswCQYDVQQGEwJCRzEOMAwGA1UEBxMFU29maWExFDASBgNVBAoTC0JPUklDQSBM\ndGQuMRwwGgYDVQQLExNTZWN1cml0eSBEZXBhcnRtZW50MRcwFQYDVQQDEw5CT1JJ\nQ0EgUm9vdCBDQYIFAIETPnUwCwYDVR0PBAQDAgP4MDsGA1UdJQQ0MDIGCCsGAQUF\nBwMBBggrBgEFBQcDAgYIKwYBBQUHAwMGCCsGAQUFBwMEBggrBgEFBQcDCDARBglg\nhkgBhvhCAQEEBAMCBeAwHgYJYIZIAYb4QgENBBEWD3hjYSBjZXJ0aWZpY2F0ZTAN\nBgkqhkiG9w0BAQsFAAOCAQEALJ6AyTnSuk2KkZJFLKtyGpXMVuWhqyX1ZIZeDGLd\nEQIN8crl35xm1gUk/cg6+23/mKSKDmhK3NJyCxjU2wXaFyPdQy4x0ix2BIbHbZFa\nuUZfTmfKPXJE+QEviEuUVpa5hQLCoDAxjVoVKAawPC6ktg8CE4T1u6yXtRTwDLuf\nsDeL1l7A+rB5n1JlCRmxdJ/AMM7xQoII9dK8E1NtnEcCEJIjtjojJUgzNPhxab3S\nitBTEmrWYpxmD50yCKye20Rc/yLBq1eK4CkEdpQNpPyCsg9svwKP4NTQEep8WcFc\nKABmi5In+PLEtMKdxQTcQhwrCtJB6JOht7+Kn7qdExey0w==\n-----END CERTIFICATE-----",
      });
      const _borica = new Borica(_config);
      const result = _borica.parseResponse(msg);
      expect(result).toEqual({
        amount: 325,
        orderId: "0000072404",
        protocolVersion: "1.0",
        responseCode: "00",
        terminalId: "62161688",
        transactionCode: "10",
        transactionTime: "20200812221618",
      });
    });
  });
});
