export class SkuMappingService {
  constructor({ bitableClient, tableId }) {
    this.bitableClient = bitableClient;
    this.tableId = tableId;
    this.bySkuAndSite = new Map();
    this.bySku = new Map();
  }

  async load() {
    const records = await this.bitableClient.searchRecords(this.tableId);
    for (const record of records) {
      const f = record.fields || {};
      const amazonSku = f['Amazon SKU'];
      const site = f['站点'];
      const enabled = f['是否启用'];
      if (!amazonSku) continue;
      if (enabled && !['是', true, 'true', '启用'].includes(enabled)) continue;
      const mapping = {
        amazonSku,
        site,
        kingdeeMaterialCode: f['金蝶物料编码'] || '',
        kingdeeMaterialName: f['金蝶物料名称'] || '',
        defaultWarehouse: f['默认仓库'] || ''
      };
      if (site) this.bySkuAndSite.set(`${amazonSku}::${site}`, mapping);
      this.bySku.set(amazonSku, mapping);
    }
    return this;
  }

  find(amazonSku, site) {
    return this.bySkuAndSite.get(`${amazonSku}::${site}`) || this.bySku.get(amazonSku) || null;
  }
}
