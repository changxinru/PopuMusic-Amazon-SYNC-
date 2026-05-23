export class SpApiClient {
  constructor(config) {
    this.config = config;
  }

  async getAccessToken() {
    throw new Error('Amazon SP-API access token is not implemented in phase 1. Use dry-run first.');
  }
}
