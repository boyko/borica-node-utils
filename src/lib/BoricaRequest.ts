export default class BoricaRequest {
  url: string;
  msg: string;

  constructor(url: string, eBorica: string) {
    this.url = url;
    this.msg = eBorica;
  }

  toURL() {
    return `${this.url}?eBorica=${this.msg}`;
  }

  toAxiosConfig() {
    return {
      url: this.url,
      params: {
        eBorica: this.msg,
      },
    };
  }
}
