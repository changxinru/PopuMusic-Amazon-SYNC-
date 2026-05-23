export class LogService {
  constructor({ bitableClient, tableId, dryRun = false }) {
    this.bitableClient = bitableClient;
    this.tableId = tableId;
    this.dryRun = dryRun;
  }

  async log(entry) {
    const fields = {
      时间: new Date().toISOString(),
      类型: entry.type || '',
      站点: entry.site || '',
      sync_key: entry.syncKey || '',
      Amazon订单号: entry.amazonOrderId || '',
      'Amazon SKU': entry.amazonSku || '',
      操作: entry.action || '',
      结果: entry.result || '',
      错误信息: entry.error || ''
    };
    try {
      await this.bitableClient.createRecord(this.tableId, fields);
    } catch (err) {
      console.error('Write sync log failed:', err.message, fields);
    }
  }
}
