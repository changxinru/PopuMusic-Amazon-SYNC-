import dotenv from 'dotenv';
dotenv.config();

function bool(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'y'].includes(String(value).toLowerCase());
}

function list(value) {
  if (!value) return [];
  return String(value).split(',').map((v) => v.trim()).filter(Boolean);
}

export function getEnv() {
  return {
    amazon: {
      refreshToken: process.env.AMAZON_REFRESH_TOKEN,
      clientId: process.env.AMAZON_CLIENT_ID,
      clientSecret: process.env.AMAZON_CLIENT_SECRET,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
      roleArn: process.env.AMAZON_ROLE_ARN,
      marketplaceIds: list(process.env.AMAZON_MARKETPLACE_IDS),
      region: process.env.AMAZON_REGION,
      shipmentReportType: process.env.AMAZON_SHIPMENT_REPORT_TYPE || 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL',
      returnReportType: process.env.AMAZON_RETURN_REPORT_TYPE || 'GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA'
    },
    feishu: {
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      bitableAppToken: process.env.FEISHU_BITABLE_APP_TOKEN,
      shipmentTableId: process.env.FEISHU_SHIPMENT_TABLE_ID,
      returnTableId: process.env.FEISHU_RETURN_TABLE_ID,
      skuMappingTableId: process.env.FEISHU_SKU_MAPPING_TABLE_ID,
      syncLogTableId: process.env.FEISHU_SYNC_LOG_TABLE_ID
    },
    runtime: {
      timezone: process.env.DEFAULT_TIMEZONE || 'Asia/Shanghai',
      dryRun: bool(process.env.DRY_RUN, false)
    }
  };
}
