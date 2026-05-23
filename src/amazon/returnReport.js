export async function fetchReturnRows(reportsClient, options) {
  return reportsClient.getReportRows({ ...options, type: 'return' });
}
