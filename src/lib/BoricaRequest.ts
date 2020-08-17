export default class BoricaRequest {
  url: string;
  msg: string;

  constructor(url: string, eBorica: string) {
    this.url = url;
    this.msg = eBorica;
  }

  toURL(): string {
    return `${this.url}?eBorica=${this.msg}`;
  }

  toAxiosConfig(): {url: string, params: {eBorica: string}} {
    return {
      url: this.url,
      params: {
        eBorica: this.msg,
      },
    };
  }
}
