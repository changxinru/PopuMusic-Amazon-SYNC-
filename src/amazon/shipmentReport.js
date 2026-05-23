export async function fetchShipmentRows(reportsClient, options) {
  return reportsClient.getReportRows({ ...options, type: 'shipment' });
}
