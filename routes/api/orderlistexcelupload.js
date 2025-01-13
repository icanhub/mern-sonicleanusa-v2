const express = require('express');
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
  '/fileupload',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  function(req, res, next) {
    if (!req.file) {
      res.status(401).json({ error: 'Please provide a PDF' });
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
        type: String,
      },
      Product: {
        prop: 'product',
        type: String,
      },
      SKU: {
        prop: 'sku',
        type: String,
      },
      Unit: {
        prop: 'unit',
        type: String,
      },
      Price: {
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
      'Shipping Zip': {
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
        type: String,
      },
      'Invoice Paid Date': {
        prop: 'invoice_paid_date',
        type: String,
      },
      'Tungsten PO Number (Static)': {
        prop: 'tungsten_number',
        type: String,
      },
      'Tracking Information': {
        prop: 'tracking_information',
        type: String,
      },
    };
    console.log(req.file);
    xlsxFile(req.file.path, {
      schema,
    })
      .then(rows => {
        Promise.all(
          rows.rows.map(async row => {
            const currentOrder = await Orders.findOne({
              order_number: row.order_number,
            });

            const item = [];
            const t = {
              item: row.sku,
              name: row.product,
              model: `(Model: ${row.sku})`,
              quantity: row.quantity,
              price: row.price,
              imageurl: row.sku,
              discount: row.discount !== undefined ? Number(row.discount) : 0,
              sub_total: Number(row.sub_total),
            };
            item.push(t);

            if (currentOrder) {
              currentOrder.dealeremail = row.dealer_email;
              currentOrder.ship_company = row.company;
              currentOrder.payment_type = currentOrder.payment_type;
              currentOrder.sub_total = 0;
              currentOrder.ship_first_name = row.first_name;
              currentOrder.ship_last_name = row.last_name;
              currentOrder.ship_address_1 = row.ship_address_1;
              currentOrder.ship_address_2 = row.ship_address_2;
              currentOrder.ship_city = row.ship_city;
              currentOrder.ship_state = row.ship_state;
              currentOrder.ship_zip = row.ship_zip;
              currentOrder.ship_phone = row.ship_phone;
              currentOrder.ship_e_mail =
                row.order_number.split('.')[1] === 'DS'
                  ? row.customer_email
                  : row.dealer_email;
              currentOrder.mohawk_invoice = currentOrder.mohawk_invoice;
              currentOrder.mohawk_tungsten_invoice = row.tungsten_number;
              currentOrder.mohawk_account = row.mohawk_account;
              currentOrder.mohawk_status = currentOrder.mohawk_status;
              currentOrder.mohawk_invoice_date = currentOrder.invoice_paid_date;
              currentOrder.po_manager = currentOrder.po_manager;
              currentOrder.po_number = currentOrder.po_number;
              currentOrder.po_file = currentOrder.po_file;
              currentOrder.mohawk_number = currentOrder.mohawk_number;
              currentOrder.success_code = currentOrder.success_code;
              currentOrder.cust_ref = row.order_number;
              (currentOrder.tracking_no =
                row.order_number.split('.')[1] === 'MKT'
                  ? ''
                  : row.tracking_information),
                (currentOrder.shipped_date = row.shipping_date);
              currentOrder.order_number = row.order_number;
              currentOrder.order_status = row.shipping_status;
              currentOrder.error_code = currentOrder.error_code;
              currentOrder.message = currentOrder.message;
              currentOrder.created = row.order_date;
              currentOrder.orderEmails = row.dealer_email;
              currentOrder.discount = currentOrder.discount;
              currentOrder.mkt_trackingnumber =
                row.order_number.split('.')[1] === 'MKT'
                  ? row.tracking_information
                  : '';

              currentOrder.createdBy = currentOrder.createdBy;
              currentOrder.card_type = currentOrder.card_type;
              currentOrder.ship_store_lat = currentOrder.ship_store_lat;
              currentOrder.ship_store_lng = currentOrder.ship_store_lng;
              currentOrder.items = item;

              return currentOrder;
            } else {
              return null;
            }
          })
        ).then(response => {
          let p = response.filter(el => el !== null);
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

          Promise.all(
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
          ).then(response => {
            console.log('success-upload');
            res.json(response);
          });
        });
      })
      .catch(error => {
        console.log('error---->', error);
      });
  }
);

module.exports = router;
