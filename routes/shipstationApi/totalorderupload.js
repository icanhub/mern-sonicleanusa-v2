const express = require('express');
var fs = require('fs');
const moment = require('moment-timezone');
const router = express.Router();
const passport = require('passport');
const Orders = require('../../models/Orders');
const orderlist = require('../../models/OrderList');
const keys = require('../../config/keys');
const multer = require('multer');
const xlsxFile = require('read-excel-file/node');
var mongoose = require('mongoose');
const Manager = require('../../models/Manager');
const User = require('../../models/User');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/orderlistexcel');
  },
  filename: (req, file, cb) => {
    var filetype = 'xlsx';
    if (file.mimetype === 'file/xlsx') {
      filetype = 'xlsx';
    }
    cb(null, 'orderlistexcel-' + Date.now() + '.' + filetype);
  },
});
var upload = multer({ storage: storage });

router.post(
  '/orders-upload',
  upload.single('file'),
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (!req.file) {
      res.status(401).json({ error: 'Please provide a excel' });
      return;
    }
    const schema = {
      'Order Number': {
        prop: 'order_number',
        type: String,
      },
      'Order Date': {
        prop: 'order_date',
        type: String,
      },
      Company: {
        prop: 'company',
        type: String,
      },
      'Mohawk Account #': {
        prop: 'mohawk_account',
        type: Number,
      },
      Product: {
        prop: 'product',
        type: String,
      },
      SKU: {
        prop: 'sku',
        type: String,
      },
      'Unit Price': {
        prop: 'unit_price',
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
      Refund: {
        prop: 'refund',
        type: String,
      },
      Total: {
        prop: 'total',
        type: String,
      },
      'First Name': {
        prop: 'first_name',
        type: String,
      },
      'Last Name': {
        prop: 'last_name',
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
        prop: 'dealer_email',
        type: String,
      },
      'Customer Email': {
        prop: 'customer_email',
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
        prop: 'shipping_status',
        type: String,
      },
      'Shipping Date': {
        prop: 'shipping_date',
        type: Date,
      },
      'Tungsten Invoice #': {
        prop: 'tungsten_invoice_number',
        type: String,
      },
      'Invoice Paid Date': {
        prop: 'invoice_paid_date',
        type: String,
      },
      'Mohawk PO #': {
        prop: 'mohawk_po_number',
        type: String,
      },
      'Tracking Information': {
        prop: 'tracking_information',
        type: String,
      },
    };

    let rows = await xlsxFile(fs.createReadStream(req.file.path), { schema });
    let rowsArr = await rows.rows;
    let tempOrders = await Promise.all(
      rowsArr.map(async row => {
        const item = [];
        const t = {
          item: row.sku,
          name: row.product,
          model: `(Model: ${row.sku})`,
          quantity: row.quantity,
          price: row.unit_price,
          imageurl: row.sku,
          discount: row.discount !== undefined ? Number(row.discount) : 0,
          sub_total: Number(row.sub_total),
        };
        item.push(t);

        let account = await User.findOne({ mohawkAccount: row.mohawk_account });

        const new_order = new Orders({
          order_number: row.order_number,
          order_status:
            row.shipping_status === 'Shipped' ? 'shipped' : 'awaiting_shipment',
          mohawk_account_number: row.mohawk_account,
          dealer_email: row.dealer_email,
          payment_type:
            row.payment_type === 'Credit/Debit Card'
              ? 'stripe'
              : row.payment_type === 'Invoiced through Mohawk'
              ? 'mohawk'
              : 'freepaid',
          sub_total: row.sub_total,
          discount: row.discount,
          ship_company: row.company,
          ship_first_name: row.first_name,
          ship_last_name: row.last_name,
          ship_address_1: row.ship_address_1,
          ship_address_2: row.ship_address_2,
          ship_city: row.ship_city,
          ship_state: row.ship_state,
          ship_zip: row.ship_zip,
          ship_phone: row.ship_phone,
          ship_e_mail:
            row.ship_e_mail === undefined ? row.dealer_email : row.ship_e_mail,
          bill_company: row.company,
          bill_first_name: row.ship_first_name,
          bill_last_name: row.ship_last_name,
          bill_address_1: row.ship_address_1,
          bill_address_2: row.ship_address_2,
          bill_city: row.ship_city,
          bill_state: row.ship_state,
          bill_zip: row.ship_zip,
          bill_phone: row.ship_phone,
          bill_e_mail: row.dealer_email,
          mohawk_order_invoice_file:
            row.tungsten_invoice_number !== undefined
              ? 'Tungsten_MHK_Invoice_' + row.tungsten_invoice_number + '.pdf'
              : undefined,
          mohawk_order_invoice_number: row.tungsten_invoice_number,
          mohawk_order_status:
            row.payment_type === 'Invoiced through Mohawk'
              ? 'released'
              : undefined,
          mohawk_order_paid_date: row.invoice_paid_date,
          mohawk_po_number: row.mohawk_po_number,
          mohawk_po_file:
            row.mohawk_po_number !== undefined
              ? 'Mohawk_PO_' + row.mohawk_po_number + '.pdf'
              : undefined,
          tracking_number: row.tracking_information,
          shipped_date:
            row.shipping_status === 'Shipped' ? row.shipping_date : undefined,
          createdBy: account ? account._id : undefined,
          created: row.order_date,
          items: item,
        });
        return new_order;
      })
    );

    let p = tempOrders.filter(el => el !== null);
    unique = p
      .map(e => e['order_number'])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter(obj => p[obj])
      .map(e => p[e]);

    let orderlist = unique.map(u => {
      let b = p.filter(t => t.order_number === u.order_number);
      for (var i = 1; i < b.length; i++) {
        for (let j in b[i].items) {
          u.items.push(b[i].items[j]);
        }
      }
      return u;
    });

    const new_orders = await Promise.all(
      orderlist.map(async od => {
        od.sub_total = od.items.reduce(function(a, b) {
          return a + b['sub_total'];
        }, 0);
        od.discount = od.items.reduce(function(a, b) {
          return a + b['discount'];
        }, 0);

        let new_save_order = await od.save();
        return new_save_order;
      })
    );

    // console.log(new_orders);
  }
);

module.exports = router;
