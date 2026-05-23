import { buildShipmentSyncKey } from './buildSyncKey.js';

export function normalizeShipment(raw, skuMappingService) {
  const site = raw.site || raw.marketplaceId || '';
  const mapping = skuMappingService.find(raw.amazonSku, site);
  const syncKey = buildShipmentSyncKey(raw);
  const matched = Boolean(mapping?.kingdeeMaterialCode);
  return {
    tableType: 'shipment',
    syncKey,
    fields: {
      sync_key: syncKey,
      数据日期: raw.shipmentDate,
      站点: site,
      Amazon订单号: raw.amazonOrderId,
      'Amazon SKU': raw.amazonSku,
      金蝶物料编码: mapping?.kingdeeMaterialCode || '',
      数量: Number(raw.quantity || 0),
      类型: '发货',
      仓库: mapping?.defaultWarehouse || raw.warehouse || '',
      金蝶同步状态: matched ? '待同步金蝶' : '异常',
      失败原因: matched ? '' : 'SKU未匹配金蝶物料',
      原始数据JSON: JSON.stringify(raw),
      更新时间: new Date().toISOString()
    }
  };
}
