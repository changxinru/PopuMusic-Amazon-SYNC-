import { buildReturnSyncKey } from './buildSyncKey.js';

function mapDisposition(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('sellable')) return '可售';
  if (v.includes('damaged') || v.includes('defective')) return '损坏';
  if (v.includes('unsellable')) return '不可售';
  return value ? '待确认' : '未知';
}

export function normalizeReturn(raw, skuMappingService) {
  const site = raw.site || raw.marketplaceId || '';
  const mapping = skuMappingService.find(raw.amazonSku, site);
  const syncKey = buildReturnSyncKey(raw);
  const matched = Boolean(mapping?.kingdeeMaterialCode);
  return {
    tableType: 'return',
    syncKey,
    fields: {
      sync_key: syncKey,
      数据日期: raw.returnDate,
      站点: site,
      Amazon订单号: raw.amazonOrderId,
      'Amazon SKU': raw.amazonSku,
      金蝶物料编码: mapping?.kingdeeMaterialCode || '',
      数量: Number(raw.quantity || 0),
      类型: '退货',
      退货可售状态: mapDisposition(raw.disposition),
      仓库: mapping?.defaultWarehouse || raw.warehouse || '',
      金蝶同步状态: matched ? '待同步金蝶' : '异常',
      失败原因: matched ? '' : 'SKU未匹配金蝶物料',
      原始数据JSON: JSON.stringify(raw),
      更新时间: new Date().toISOString()
    }
  };
}
