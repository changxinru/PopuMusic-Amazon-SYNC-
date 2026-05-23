import { getEnv } from '../config/env.js';
import { FeishuClient } from '../feishu/feishuClient.js';
import { WikiClient } from '../feishu/wikiClient.js';
import { SheetsClient } from '../feishu/sheetsClient.js';
import { SheetSkuMappingService } from '../feishu/sheetSkuMappingService.js';
import { SheetRecordService } from '../feishu/sheetRecordService.js';
import { ConsoleLogService } from '../feishu/consoleLogService.js';
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

async function processRows({ rows, normalize, targetSheetId, kind, recordService, logService, skuMappingService }) {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const raw of rows) {
    const item = normalize(raw, skuMappingService);
    try {
      const result = await recordService.createIfNotExists(targetSheetId, item.fields, kind);
      if (result.skipped) {
        skipped += 1;
        await logService.log({
          type: item.fields.类型,
          site: item.fields.站点,
          syncKey: item.syncKey,
          amazonOrderId: item.fields.Amazon订单号,
          amazonSku: item.fields['Amazon SKU'],
          action: '跳过重复记录',
          result: '跳过'
        });
      } else {
        created += 1;
        await logService.log({
          type: item.fields.类型,
          site: item.fields.站点,
          syncKey: item.syncKey,
          amazonOrderId: item.fields.Amazon订单号,
          amazonSku: item.fields['Amazon SKU'],
          action: '新增飞书电子表格记录',
          result: '成功'
        });
      }
    } catch (err) {
      failed += 1;
      await logService.log({
        type: item.fields.类型,
        site: item.fields.站点,
        syncKey: item.syncKey,
        amazonOrderId: item.fields.Amazon订单号,
        amazonSku: item.fields['Amazon SKU'],
        action: '写入失败',
        result: '失败',
        error: err.message
      });
    }
  }

  return { created, skipped, failed };
}

async function resolveSpreadsheetToken({ env, feishuClient, dryRun }) {
  if (env.feishu.spreadsheetToken) return env.feishu.spreadsheetToken;
  const wikiClient = new WikiClient({
    feishuClient,
    wikiToken: env.feishu.wikiToken,
    dryRun
  });
  return wikiClient.getSpreadsheetToken();
}

export async function runAmazonToFeishuSync(args = {}) {
  const env = getEnv();
  const dryRun = Boolean(args.dryRun || env.runtime.dryRun);
  const range = args.start && args.end ? { start: args.start, end: args.end } : yesterdayRange();
  const type = args.type || 'all';

  const feishuClient = new FeishuClient({ ...env.feishu, dryRun });
  const spreadsheetToken = await resolveSpreadsheetToken({ env, feishuClient, dryRun });
  const sheetsClient = new SheetsClient({ feishuClient, spreadsheetToken, dryRun });

  const skuMappingService = new SheetSkuMappingService({
    sheetsClient,
    sheetId: env.feishu.skuMappingSheetId
  });
  await skuMappingService.load();

  const recordService = new SheetRecordService({ sheetsClient });
  const logService = new ConsoleLogService();
  const reportsClient = new ReportsClient({ dryRun });
  const common = { start: range.start, end: range.end, marketplaceIds: env.amazon.marketplaceIds };

  const summary = { range, dryRun, source: 'feishu-sheets', shipment: null, return: null };

  if (type === 'all' || type === 'shipment') {
    const rows = await fetchShipmentRows(reportsClient, common);
    summary.shipment = await processRows({
      rows,
      normalize: normalizeShipment,
      targetSheetId: env.feishu.shipmentSheetId,
      kind: 'shipment',
      recordService,
      logService,
      skuMappingService
    });
  }

  if (type === 'all' || type === 'return') {
    const rows = await fetchReturnRows(reportsClient, common);
    summary.return = await processRows({
      rows,
      normalize: normalizeReturn,
      targetSheetId: env.feishu.returnSheetId,
      kind: 'return',
      recordService,
      logService,
      skuMappingService
    });
  }

  console.log(JSON.stringify(summary, null, 2));
  return summary;
}
