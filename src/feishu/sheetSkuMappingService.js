export class SheetSkuMappingService {
  constructor({ sheetsClient, sheetId }) {
    this.sheetsClient = sheetsClient;
    this.sheetId = sheetId;
    this.bySkuAndSite = new Map();
    this.bySku = new Map();
  }

  async load() {
    const records = await this.sheetsClient.readObjects(this.sheetId);
    for (const record of records) {
      const f = record.fields || {};
      const amazonSku = f['Amazon SKU'] || f['AmazonSKU'] || f['SKU'] || f['亚马逊SKU'];
      const site = f['站点'] || '';
      const enabled = f['是否启用'];
      if (!amazonSku) continue;
      if (enabled && !['是', 'true', 'TRUE', '启用', '1'].includes(String(enabled))) continue;

      const mapping = {
        amazonSku,
        site,
        kingdeeMaterialCode: f['金蝶物料编码'] || '',
        kingdeeMaterialName: f['金蝶物料名称'] || '',
        defaultWarehouse: f['默认仓库'] || f['仓库'] || ''
      };

      if (site) this.bySkuAndSite.set(`${amazonSku}::${site}`, mapping);
      this.bySku.set(amazonSku, mapping);
    }

    console.log(`[INFO] Loaded SKU mappings: ${this.bySku.size}`);
    return this;
  }

  find(amazonSku, site) {
    return this.bySkuAndSite.get(`${amazonSku}::${site}`) || this.bySku.get(amazonSku) || null;
  }
}
