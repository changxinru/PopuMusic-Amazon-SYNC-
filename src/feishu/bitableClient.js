export class BitableClient {
  constructor({ feishuClient, appToken, dryRun = false }) {
    this.feishuClient = feishuClient;
    this.appToken = appToken;
    this.dryRun = dryRun;
  }

  async searchRecords(tableId, { fieldNames = [], filter = null, pageSize = 500 } = {}) {
    if (this.dryRun) return [];
    if (!this.appToken || !tableId) throw new Error('Missing Feishu bitable appToken or tableId');
    const body = { page_size: pageSize };
    if (fieldNames.length) body.field_names = fieldNames;
    if (filter) body.filter = filter;
    const data = await this.feishuClient.request(`/bitable/v1/apps/${this.appToken}/tables/${tableId}/records/search`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return data.items || [];
  }

  async createRecord(tableId, fields) {
    if (this.dryRun) {
      console.log('[DRY_RUN] createRecord', { tableId, fields });
      return { record_id: `dry_${Date.now()}`, fields };
    }
    const data = await this.feishuClient.request(`/bitable/v1/apps/${this.appToken}/tables/${tableId}/records`, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    return data.record;
  }
}
