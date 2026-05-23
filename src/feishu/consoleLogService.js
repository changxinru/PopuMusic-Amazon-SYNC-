export class ConsoleLogService {
  async log({ type, site, syncKey, amazonOrderId, amazonSku, action, result, error }) {
    const payload = {
      time: new Date().toISOString(),
      type,
      site,
      syncKey,
      amazonOrderId,
      amazonSku,
      action,
      result,
      error: error || ''
    };
    console.log('[SYNC_LOG]', JSON.stringify(payload));
  }
}
