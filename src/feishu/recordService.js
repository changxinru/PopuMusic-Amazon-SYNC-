export class RecordService {
  constructor({ bitableClient }) {
    this.bitableClient = bitableClient;
  }

  async existsBySyncKey(tableId, syncKey) {
    const records = await this.bitableClient.searchRecords(tableId, {
      filter: {
        conjunction: 'and',
        conditions: [{ field_name: 'sync_key', operator: 'is', value: [syncKey] }]
      }
    });
    return records.length > 0;
  }

  async createIfNotExists(tableId, fields) {
    const syncKey = fields.sync_key;
    if (await this.existsBySyncKey(tableId, syncKey)) return { skipped: true, reason: 'duplicate sync_key' };
    const record = await this.bitableClient.createRecord(tableId, fields);
    return { skipped: false, record };
  }
}
