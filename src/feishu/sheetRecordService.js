export const SHIPMENT_HEADERS = [
  'sync_key',
  '数据日期',
  '站点',
  'Amazon订单号',
  'Amazon SKU',
  '金蝶物料编码',
  '数量',
  '类型',
  '仓库',
  '金蝶同步状态',
  '失败原因',
  '原始数据JSON',
  '更新时间'
];

export const RETURN_HEADERS = [
  'sync_key',
  '数据日期',
  '站点',
  'Amazon订单号',
  'Amazon SKU',
  '金蝶物料编码',
  '数量',
  '类型',
  '退货可售状态',
  '仓库',
  '金蝶同步状态',
  '失败原因',
  '原始数据JSON',
  '更新时间'
];

export class SheetRecordService {
  constructor({ sheetsClient }) {
    this.sheetsClient = sheetsClient;
  }

  getHeaders(kind) {
    return kind === 'return' ? RETURN_HEADERS : SHIPMENT_HEADERS;
  }

  async existsBySyncKey(sheetId, syncKey) {
    const rows = await this.sheetsClient.readObjects(sheetId);
    return rows.some((row) => String(row.fields?.sync_key || '') === String(syncKey));
  }

  async createIfNotExists(sheetId, fields, kind = 'shipment') {
    const syncKey = fields.sync_key;
    if (await this.existsBySyncKey(sheetId, syncKey)) {
      return { skipped: true, reason: 'duplicate sync_key' };
    }

    const record = await this.sheetsClient.appendObject(sheetId, fields, this.getHeaders(kind));
    return { skipped: false, record };
  }
}
