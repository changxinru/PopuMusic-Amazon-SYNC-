export class ReportsClient {
  constructor({ dryRun = false } = {}) {
    this.dryRun = dryRun;
  }

  async getReportRows({ type, start, end, marketplaceIds }) {
    if (!this.dryRun) throw new Error('Amazon SP-API report download is not implemented in phase 1. Use --dry-run.');
    const marketplaceId = marketplaceIds?.[0] || 'ATVPDKIKX0DER';
    if (type === 'shipment') {
      return [{ marketplaceId, site: 'US', amazonOrderId: '111-TEST-0001', amazonSku: 'TEST-SKU-001', shipmentDate: start, quantity: 1 }];
    }
    return [{ marketplaceId, site: 'US', amazonOrderId: '111-TEST-0002', amazonSku: 'TEST-SKU-002', returnDate: start, quantity: 1, disposition: 'SELLABLE', reason: 'CustomerReturn' }];
  }
}
