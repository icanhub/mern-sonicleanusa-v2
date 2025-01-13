const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

var Notes = require('./Notes');

const OrdersSchema = new Schema(
  {
    order_Id: { type: String },
    order_number: { type: String, require: true },
    PO_number: { type: String, require: false },
    order_status: { type: String, require: true },
    order_key: { type: String },
    mohawk_account_number: {
      type: String,
      required: function() {
        return !this.vacuum_account_number;
      },
    },
    vacuum_account_number: {
      type: String,
      required: function() {
        return !this.mohawk_account_number;
      },
    },
    dealer_email: { type: String },
    cc_emails: { type: String },
    payment_type: { type: String },
    sub_total: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    ship_company: { type: String },
    ship_first_name: { type: String },
    ship_last_name: { type: String },
    ship_address_1: { type: String },
    ship_address_2: { type: String },
    ship_city: { type: String },
    ship_state: { type: String },
    ship_zip: { type: String },
    ship_phone: { type: String },
    ship_e_mail: { type: String },
    bill_company: { type: String },
    bill_first_name: { type: String },
    bill_last_name: { type: String },
    bill_address_1: { type: String },
    bill_address_2: { type: String },
    bill_city: { type: String },
    bill_state: { type: String },
    bill_zip: { type: String },
    bill_phone: { type: String },
    bill_e_mail: { type: String },
    mohawk_order_invoice_file: { type: String },
    mohawk_order_invoice_number: { type: String },
    mohawk_order_status: { type: String },
    mohawk_order_paid_date: { type: Date },
    mohawk_po_manager: { type: String },
    mohawk_po_number: { type: String },
    mohawk_po_file: { type: String },
    tracking_number: { type: String },
    shipped_date: { type: Date, overwrite: true },
    created: { type: Date, default: Date.now },
    createdBy: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    ship_store_lat: { type: String },
    ship_store_lng: { type: String },
    carrier_code: { type: String },
    items: [],
    notes: [Notes.schema],
  },
  {
    timestamps: true,
  }
);

module.exports = Orders = mongoose.model('orders', OrdersSchema);
