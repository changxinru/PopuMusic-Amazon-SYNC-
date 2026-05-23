export function buildShipmentSyncKey(record) {
  return ['shipment', record.marketplaceId, record.amazonOrderId, record.amazonSku, record.shipmentDate, record.quantity].join(':');
}

export function buildReturnSyncKey(record) {
  return ['return', record.marketplaceId, record.amazonOrderId, record.amazonSku, record.returnDate, record.disposition || record.reason || 'unknown', record.quantity].join(':');
}
