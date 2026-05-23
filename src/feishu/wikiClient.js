export class WikiClient {
  constructor({ feishuClient, wikiToken, dryRun = false }) {
    this.feishuClient = feishuClient;
    this.wikiToken = wikiToken;
    this.dryRun = dryRun;
  }

  async getSpreadsheetToken() {
    if (this.dryRun) return 'dry-run-spreadsheet-token';
    if (!this.wikiToken) throw new Error('Missing FEISHU_WIKI_TOKEN or FEISHU_SPREADSHEET_TOKEN');

    const data = await this.feishuClient.request(`/wiki/v2/spaces/get_node?token=${encodeURIComponent(this.wikiToken)}`, {
      method: 'GET'
    });

    const node = data?.node || data;
    const objToken = node?.obj_token || node?.objToken;
    const objType = node?.obj_type || node?.objType;

    if (!objToken) {
      throw new Error(`Failed to resolve spreadsheet token from wiki token: ${JSON.stringify(data)}`);
    }

    if (objType && !['sheet', 'spreadsheet'].includes(String(objType).toLowerCase())) {
      console.warn(`[WARN] Wiki node obj_type is ${objType}, expected sheet/spreadsheet. Continue with obj_token.`);
    }

    return objToken;
  }
}
