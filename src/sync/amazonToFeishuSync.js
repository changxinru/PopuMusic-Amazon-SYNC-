import { getEnv } from '../config/env.js';
import { FeishuClient } from '../feishu/feishuClient.js';
import { BitableClient } from '../feishu/bitableClient.js';
import { SkuMappingService } from '../feishu/skuMappingService.js';
import { RecordService } from '../feishu/recordService.js';
import { LogService } from '../feishu/logService.js';
import { ReportsClient } from '../amazon/reportsClient.js';
import { fetchShipmentRows } from '../amazon/shipmentReport.js';
import { fetchReturnRows } from '../amazon/returnReport.js';
import { normalizeShipment } from './normalizeShipment.js';
import { normalizeReturn } from './normalizeReturn.js';

function yesterdayRange() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const date = `${yyyy}-${mm}-${dd}`;
  return { start: date, end: date };
}

async function processRows({ rows, normalize, targetTableId, recordService, logService, skuMappingService, dryRun }) {
  let created = 0;
  let skipped = 0;
  let failed = 0;
  for (const raw of rows) {
    const item = normalize(raw, skuMappingService);
    try {
      const result = await recordService.createIfNotExists(targetTableId, item.fields);
      if (result.skipped) {
        skipped += 1;
        await logService.log({ type: item.fields.类型, site: item.fields.站点, syncKey: item.syncKey, amazonOrderId: item.fields.Amazon订单号, amazonSku: item.fields['Amazon SKU'], action: '跳过重复记录', result: '跳过' });
      } else {
        created += 1;
        await logService.log({ type: item.fields.类型, site: item.fields.站点, syncKey: item.syncKey, amazonOrderId: item.fields.Amazon订单号, amazonSku: item.fields['Amazon SKU'], action: dryRun ? 'dry-run新增飞书记录' : '新增飞书记录', result: '成功' });
      }
    } catch (err) {
      failed += 1;
      await logService.log({ type: item.fields.类型, site: item.fields.站点, syncKey: item.syncKey, amazonOrderId: item.fields.Amazon订单号, amazonSku: item.fields['Amazon SKU'], action: '写入失败', result: '失败', error: err.message });
    }
  }
  return { created, skipped, failed };
}

export async function runAmazonToFeishuSync(args = {}) {
  const env = getEnv();
  const dryRun = Boolean(args.dryRun || env.runtime.dryRun);
  const range = args.start && args.end ? { start: args.start, end: args.end } : yesterdayRange();
  const type = args.type || 'all';

  const feishuClient = new FeishuClient({ ...env.feishu, dryRun });
  const bitableClient = new BitableClient({ feishuClient, appToken: env.feishu.bitableAppToken, dryRun });
  const skuMappingService = new SkuMappingService({ bitableClient, tableId: env.feishu.skuMappingTableId });
  await skuMappingService.load();

  const recordService = new RecordService({ bitableClient });
  const logService = new LogService({ bitableClient, tableId: env.feishu.syncLogTableId, dryRun });
  const reportsClient = new ReportsClient({ dryRun });
  const common = { start: range.start, end: range.end, marketplaceIds: env.amazon.marketplaceIds };

  const summary = { range, dryRun, shipment: null, return: null };

  if (type === 'all' || type === 'shipment') {
    const rows = await fetchShipmentRows(reportsClient, common);
    summary.shipment = await processRows({ rows, normalize: normalizeShipment, targetTableId: env.feishu.shipmentTableId, recordService, logService, skuMappingService, dryRun });
  }

  if (type === 'all' || type === 'return') {
    const rows = await fetchReturnRows(reportsClient, common);
    summary.return = await processRows({ rows, normalize: normalizeReturn, targetTableId: env.feishu.returnTableId, recordService, logService, skuMappingService, dryRun });
  }

  console.log(JSON.stringify(summary, null, 2));
  return summary;
}
