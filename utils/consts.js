module.exports.DEFAULT_PAGINATION_LIMIT = 50;
module.exports.DEFAULT_PAGINATION_PAGE = 0;
module.exports.orderDirections = {
  desc: -1,
  asc: 1,
};
module.exports.orderDirectionValues = ['desc', 'asc'];

module.exports.karastanExcelSchema = {
  'Dealer Code': {
    prop: 'code',
    type: String,
  },
  'Dealer Name': {
    prop: 'dealerName',
    type: String,
  },
  'Address 1': {
    prop: 'addressOne',
    type: String,
  },
  'Address 2': {
    prop: 'addressTwo',
    type: String,
  },
  'Address 3': {
    prop: 'addressThree',
    type: String,
  },
  City: {
    prop: 'city',
    type: String,
  },
  ST: {
    prop: 'st',
    type: String,
  },
  Zip: {
    prop: 'zipcode',
    type: String,
  },
  'Phone #': {
    prop: 'phone',
    type: String,
  },
  Region: {
    prop: 'region',
    type: String,
  },
};

module.exports.orderXlsxSchema = {
  'Mohawk Account #': {
    prop: 'mohawk_account',
    type: String,
  },
  Company: {
    prop: 'ship_company',
    type: String,
  },
  'Order Number': {
    prop: 'order_number',
    type: String,
  },
  'Order Date': {
    prop: 'created',
    type: String,
  },
  SKU: {
    prop: 'item',
    type: String,
  },
  Product: {
    prop: 'name',
    type: String,
  },
  'Unit Price': {
    prop: 'price',
    type: String,
  },
  Quantity: {
    prop: 'quantity',
    type: String,
  },
  Subtotal: {
    prop: 'sub_total',
    type: String,
  },
  Discount: {
    prop: 'discount',
    type: String,
  },
  'First Name': {
    prop: 'ship_first_name',
    type: String,
  },
  'Last Name': {
    prop: 'ship_last_name',
    type: String,
  },
  'Shipping Add. 1': {
    prop: 'ship_address_1',
    type: String,
  },
  'Shipping Add. 2': {
    prop: 'ship_address_2',
    type: String,
  },
  'Shipping City': {
    prop: 'ship_city',
    type: String,
  },
  'Shipping State': {
    prop: 'ship_state',
    type: String,
  },
  'Shipping Zip Code': {
    prop: 'ship_zip',
    type: String,
  },
  'Phone Number': {
    prop: 'ship_phone',
    type: String,
  },
  'Dealer Email': {
    prop: 'orderEmails',
    type: String,
  },
  'Customer Email': {
    prop: 'ship_e_mail',
    type: String,
  },
  'Payment Status': {
    prop: 'payment_status',
    type: String,
  },
  'Payment Type': {
    prop: 'payment_type',
    type: String,
  },
  'Shipping Status': {
    prop: 'order_status',
    type: String,
  },
  'Tracking Information': {
    prop: 'tracking_no',
    type: String,
  },
};
