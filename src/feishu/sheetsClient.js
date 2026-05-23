function columnName(index) {
  let n = index + 1;
  let name = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function normalizeValue(value) {
  if (Array.isArray(value)) return value.map(normalizeValue).join(',');
  if (value && typeof value === 'object') {
    if ('text' in value) return value.text;
    if ('name' in value) return value.name;
    return JSON.stringify(value);
  }
  return value ?? '';
}

export class SheetsClient {
  constructor({ feishuClient, spreadsheetToken, dryRun = false }) {
    this.feishuClient = feishuClient;
    this.spreadsheetToken = spreadsheetToken;
    this.dryRun = dryRun;
    this.memory = new Map();
  }

  async readValues(sheetId, range = 'A1:Z5000') {
    const fullRange = `${sheetId}!${range}`;
    if (this.dryRun) {
      return this.memory.get(fullRange) || [];
    }

    if (!this.spreadsheetToken) throw new Error('Missing FEISHU_SPREADSHEET_TOKEN');
    const encodedRange = encodeURIComponent(fullRange);
    const data = await this.feishuClient.request(`/sheets/v2/spreadsheets/${this.spreadsheetToken}/values/${encodedRange}`, {
      method: 'GET'
    });
    return data?.valueRange?.values || [];
  }

  async readObjects(sheetId, range = 'A1:Z5000') {
    const values = await this.readValues(sheetId, range);
    if (!values.length) return [];

    const headers = values[0].map((v) => String(normalizeValue(v)).trim());
    return values.slice(1)
      .filter((row) => row.some((cell) => String(normalizeValue(cell)).trim() !== ''))
      .map((row, index) => {
        const fields = {};
        headers.forEach((header, i) => {
          if (!header) return;
          fields[header] = normalizeValue(row[i]);
        });
        return { rowNumber: index + 2, fields };
      });
  }

  async appendObject(sheetId, fields, headers) {
    const row = headers.map((header) => fields[header] ?? '');
    return this.appendValues(sheetId, [row], headers.length);
  }

  async appendValues(sheetId, values, width = 26) {
    const endColumn = columnName(Math.max(width - 1, 0));
    const range = `${sheetId}!A:${endColumn}`;

    if (this.dryRun) {
      console.log('[DRY_RUN] Append sheet values:', JSON.stringify({ sheetId, range, values }, null, 2));
      return { dryRun: true, values };
    }

    if (!this.spreadsheetToken) throw new Error('Missing FEISHU_SPREADSHEET_TOKEN');
    const data = await this.feishuClient.request(`/sheets/v2/spreadsheets/${this.spreadsheetToken}/values_append`, {
      method: 'POST',
      body: JSON.stringify({
        valueRange: {
          range,
          values
        }
      })
    });
    return data;
  }
}
