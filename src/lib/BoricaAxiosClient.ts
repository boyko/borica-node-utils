import axios, { AxiosInstance } from "axios";
import https from "https";

interface IBoricaClient {
  clientKey: string;
  clientCert: string;
  agent: AxiosInstance;
}

/**
 * An axios client configured with BORICA client key and client certificate.
 */
export default class BoricaAxiosClient implements IBoricaClient {
  clientKey: string;
  clientCert: string;
  agent: AxiosInstance;

  /**
   *
   * @param clientKey The client key was generated from the user (usually called eTransactionLog.key).
   * @param clientCert The client certificate obtained from BORICA
   */
  constructor(clientKey: string, clientCert: string) {
    this.clientKey = clientKey;
    this.clientCert = clientCert;
    const httpsAgent = new https.Agent({
      rejectUnauthorized: true,
      cert: this.clientCert,
      key: this.clientKey,
    });
    this.agent = axios.create({ httpsAgent });
  }
}
