const keys = require('../config/keys');
 
const getOrderName = orderNumber => {
  return orderNumber.split('.')[0];
};

const getOrderType = orderNumber => {
  return orderNumber.split('.')[1];
};

const getNextOrderNumber = (last_order_name, orderType) => {
  return (Number(last_order_name) + 1).toString() + '.' + orderType;
};

const isMKTOrder = orderNumber => {
  return getOrderType(orderNumber) === 'MKT';
};

const isINVOrder = orderNumber => {
  return getOrderType(orderNumber) === 'INV';
};

const isDSSOrder = orderNumber => {
  return getOrderType(orderNumber) === 'DSS';
};

const isDSOrder = orderNumber => {
  return getOrderType(orderNumber) === 'DS';
};

const isDEMOrder = orderNumber => {
  return getOrderType(orderNumber) === 'DEM';
};

const isStripePaid = card => {
  return card === 'stripe';
};

const isFreePaid = card => {
  return card === 'freepaid';
};

const isMohawkPaid = card => {
  return card === 'mohawk';
};

const shipStationSecret = () => {
  return (
    'Basic ' +
    Buffer.from(
      keys.ShipstationApiKey + ':' + keys.ShipstationApiSecret
    ).toString('base64')
  );
};

exports.getOrderName = getOrderName;
exports.getOrderType = getOrderType;
exports.getNextOrderNumber = getNextOrderNumber;
exports.isMKTOrder = isMKTOrder;
exports.isINVOrder = isINVOrder;
exports.isDSSOrder = isDSSOrder;
exports.isDSOrder = isDSOrder;
exports.isDEMOrder = isDEMOrder;
exports.isStripePaid = isStripePaid;
exports.isFreePaid = isFreePaid;
exports.isMohawkPaid = isMohawkPaid;
exports.shipStationSecret = shipStationSecret;
