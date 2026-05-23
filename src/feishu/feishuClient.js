export class FeishuClient {
  constructor({ appId, appSecret, dryRun = false }) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.dryRun = dryRun;
    this.tenantAccessToken = null;
  }

  async getTenantAccessToken() {
    if (this.dryRun) return 'dry-run-feishu-token';
    if (!this.appId || !this.appSecret) throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET');

    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret })
    });
    const data = await response.json();
    if (!response.ok || data.code !== 0) throw new Error(`Feishu token failed: ${JSON.stringify(data)}`);
    this.tenantAccessToken = data.tenant_access_token;
    return this.tenantAccessToken;
  }

  async request(path, options = {}) {
    const token = this.tenantAccessToken || await this.getTenantAccessToken();
    const response = await fetch(`https://open.feishu.cn/open-apis${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await response.json();
    if (!response.ok || data.code !== 0) throw new Error(`Feishu API failed: ${JSON.stringify(data)}`);
    return data.data;
  }
}
