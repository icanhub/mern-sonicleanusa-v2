const express = require('express');
const router = express.Router();
const passport = require('passport');
const moment = require('moment-timezone');
const multer = require('multer');
const xlsxFile = require('read-excel-file/node');
const axios = require('axios');
const Orders = require('../../models/Orders');
const User = require('../../models/User');
const MohawkToken = require('../../models/MohawkToken');
const keys = require('../../config/keys');

const emailManager = require('../../utils/emailmanager.js');
const { shipStationSecret } = require('../../utils/helper');
const products = require('../../config/products');

const baseURL = `https://ssapi.shipstation.com/orders`;

/* GET Orders List method */
router.get(
  '/orderslist',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let query = { order_number: { $ne: 'DEMO_MANUAL.DEM' } };

    if (req.query.id) {
      req.query.id.includes('VD')
        ? (query['vacuum_account_number'] = req.query.id)
        : (query['mohawk_account_number'] = req.query.id);
    }

    // console.log('query order', query);
    try {
      let orders = await Orders.find(query).sort({ created: 'desc' });
      res.json(orders);
      // console.log('after result', Date(Date.now()));
    } catch (error) {
      console.log(error);
      res.status(404).json({ messages: 'cannot find orders!' });
    }
  }
);

/* GET a Order by ID method */
router.get(
  '/order/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let order = await Orders.findOne({ _id: req.params.id });
      res.json(order);
    } catch (error) {
      return res.status(404).json({ message: 'Cannot find the Order.' });
    }
  }
);

router.delete(
  '/order/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let order = await Orders.findByIdAndRemove(req.params.id);
      if (order.order_Id) {
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Authorization'] = shipStationSecret();
        await axios.delete(`${baseURL}/${order.order_Id}`);
      }

      if (order === null) {
        res.status(400).json({ message: 'Oops! cannot find the order' });
      } else {
        res.json(order);
      }
    } catch (error) {
      res.status(400).json({ message: 'Oops! cannot remove the order' });
    }
  }
);

router.put(
  '/order/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let order = await Orders.findById(req.params.id);
      order['mohawk_account_number'] = req.body['mohawk_account_number'];
      order['dealer_email'] = req.body['dealer_email'];
      order['order_status'] = req.body['order_status'];
      order['payment_type'] = req.body['payment_type'];
      order['ship_company'] = req.body['ship_company'];
      order['ship_first_name'] = req.body['ship_first_name'];
      order['ship_last_name'] = req.body['ship_last_name'];
      order['ship_address_1'] = req.body['ship_address_1'];
      order['ship_address_2'] = req.body['ship_address_2'];
      order['ship_city'] = req.body['ship_city'];
      order['ship_state'] = req.body['ship_state'];
      order['ship_zip'] = req.body['ship_zip'];
      order['ship_phone'] = req.body['ship_phone'];
      order['ship_e_mail'] = req.body['ship_e_mail'];
      order['sub_total'] = req.body['sub_total'];
      order['discount'] = req.body['discount'];
      order['items'] = req.body['items'];
      order['tracking_number'] = req.body['tracking_number'];

      let new_order = await order.save();
      if (new_order === null) {
        res.status(400).json({ message: 'Oops! cannot updated the order' });
      } else {
        res.json(new_order);
      }
    } catch (error) {
      res.status(400).json({ message: 'Oops! cannot find the order' });
    }
  }
);

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

router.put(
  '/:id/fileupload',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  function (req, res, next) {
    if (!req.file) {
      res.status(401).json({ error: 'Please provide a PDF' });
      return;
    }
    const schema = {
      'Mohawk Account #': {
        prop: 'mohawk_account_number',
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
        prop: 'dealer_email',
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
      'Tungsten Invoice #': {
        prop: 'tungsten_invoice',
        type: String,
      },
      'Invoice Paid Date': {
        prop: 'invoice_paid_date',
        type: String,
      },
      'Mohawk PO #': {
        prop: 'mohawk_po',
        type: String,
      },
      'Tracking Information': {
        prop: 'tracking_no',
        type: String,
      },
    };

    xlsxFile(`${req.file.path}`, {
      schema,
    }).then(rows => {
      Orders.findById(req.params.id).then(order => {
        let temp = rows.rows.map(row => {
          const item = [];
          const t = {
            item: row.item,
            name: row.name,
            model: `(Model: ${row.item})`,
            quantity: row.quantity,
            price: row.price,
            imageurl: '',
            discount: row.discount !== undefined ? Number(row.discount) : 0,
            sub_total: Number(row.sub_total),
          };
          item.push(t);

          order.payment_type =
            row.payment_type === 'Credit/Debit Card'
              ? 'stripe'
              : row.payment_type === 'No Charge'
                ? 'freepaid'
                : 'mohawk';
          order.mohawk_account_number = row.mohawk_account_number;
          order.order_number = row.order_number;
          order.created = row.created;
          order.createdBy = order.createdBy;
          order.dealer_email = row.dealer_email;
          order.order_status =
            row.order_status === 'In Process'
              ? 'awaiting_shipment'
              : row.order_status.toLowerCase();
          order.ship_company = row.ship_company;
          order.sub_total = row.sub_total;
          order.ship_first_name = row.ship_first_name;
          order.ship_last_name = row.ship_last_name;
          order.ship_address_1 = row.ship_address_1;
          order.ship_address_2 = row.ship_address_2;
          order.ship_city = row.ship_city;
          order.ship_state = row.ship_state;
          order.ship_zip = row.ship_zip;
          order.ship_phone = row.ship_zip;
          order.ship_e_mail = row.ship_e_mail;
          order.tracking_number = row.tracking_no;
          order.mohawk_order_invoice_number =
            row.tungsten_invoice !== undefined ? row.tungsten_invoice : '';
          order.mohawk_order_invoice_file =
            row.tungsten_invoice !== undefined
              ? 'Tungsten_MHK_Invoice_' + row.tungsten_invoice + '.pdf'
              : '';
          order.mohawk_po_number =
            row.mohawk_po !== undefined ? row.mohawk_po : '';
          order.mohawk_po_file =
            row.mohawk_po !== undefined
              ? 'Mohawk_PO_' + row.mohawk_po + '.pdf'
              : '';
          order.mohawk_order_paid_date = row.invoice_paid_date;
          order.items = item;
          order.discount = row.discount;

          return order;
        });

        let unique = temp
          .map(e => e['order_number'])
          .map((e, i, final) => final.indexOf(e) === i && i)
          .filter(obj => temp[obj])
          .map(e => temp[e]);

        let orderlist = unique.map(u => {
          let b = temp.filter(t => t.order_number === u.order_number);
          for (var i = 1; i < b.length; i++) {
            // u.items.push(b[i].items[0]);
            for (let j in b[i].items) {
              u.items.push(b[i].items[j]);
            }
          }
          return u;
        });

        // console.log(orderlist);
        Promise.all(
          orderlist.map(async od => {
            return await od.save();
          })
        ).then(response => {
          // console.log(response);
          res.json(response[0]);
        });
      });
    });
  }
);

router.put(
  '/mohawk-invoice-date/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // console.log(req.body);
    try {
      let order = await Orders.findById(req.params.id);
      order.mohawk_order_paid_date = moment(req.body.invoiceDate)
        .tz('America/New_York')
        .format('MM/DD/YYYY hh:mm A z');
      let updateOrder = await order.save();
      res.json(updateOrder);
    } catch (error) {
      console.log(error);
    }
  }
);

router.put(
  '/shippingmktorder/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let order = await Orders.findById(req.params.id);

    order.tracking_number = req.body.mkt_trackingnumber;
    order.order_status = 'shipped';
    order.shipped_date = new Date();
    // console.log(order.orderEmails);
    let updatedOrder = await order.save();
    res.json(updatedOrder);
    let goods = updatedOrder.items.map(item => {
      return {
        name: item.name,
        quantity: item.quantity,
        imageurl: products[item.imageurl],
        price: Number(item.price).toFixed(2),
        sub_total: Number(item.sub_total).toFixed(2),
      };
    });

    var replacements = {
      order_number: updatedOrder.order_number,
      order_company: updatedOrder.ship_company,
      payment_type: 'VISA',
      order_type: 'Marketing',
      order_date: moment(updatedOrder.created)
        .tz('America/New_York')
        .format('MM/DD/YYYY hh:mm A z'),
      shipped_date: moment(updatedOrder.shipped_date).format('MM/DD/YYYY'),
      ship_name:
        updatedOrder.ship_first_name + ' ' + updatedOrder.ship_last_name,
      ship_address_1: updatedOrder.ship_address_1,
      ship_address_2: updatedOrder.ship_address_2,
      ship_city: updatedOrder.ship_city,
      ship_state: updatedOrder.ship_state,
      ship_zip: updatedOrder.ship_zip,
      ship_country: 'USA',
      ship_email: updatedOrder.ship_e_mail,
      ship_phone: updatedOrder.ship_phone,
      mohawk_account: updatedOrder.mohawk_account_number,
      payment_status: 'Paid',
      items: goods,
      subtotal: Number(order.sub_total).toFixed(2),
      discount: Number(order.discount).toFixed(2),
      trackingNumber: updatedOrder.tracking_number,
      total: Number(
        Number(updatedOrder.sub_total) - Number(updatedOrder.discount)
      ).toFixed(2),
    };

    emailManager(
      __dirname + '/../../templates/NewDealerShippingConfirmation.html',
      replacements,
      updatedOrder.dealer_email,
      `Your Soniclean order(#: ${updatedOrder.order_number}) has shipped`,
      null,
      null,
      () => {
        console.log('success-MKT-Order-Shipped-Dealer!');
      }
    );
  }
);

router.get('/share/:token', async (req, res) => {
  // console.log(req.params.token);
  try {
    let tokenInfo = await MohawkToken.findOne({
      mohawkToken: req.params.token,
    });
    let orderId = await tokenInfo._orderId;
    let orderInfo = await Orders.findById(orderId);
    res.json(orderInfo);
  } catch (error) {
    res.status(400).json({ message: 'Oops! cannot find the order' });
  }
});

router.put('/share/:token', async (req, res) => {
  try {
    let tokenInfo = await MohawkToken.findOne({
      mohawkToken: req.params.token,
    });
    let orderId = await tokenInfo._orderId;
    let orderInfo = await Orders.findById(orderId);
    orderInfo.mohawk_order_status = req.body.status;
    let updatedOrderInfo = await orderInfo.save();
    // console.log(updatedOrderInfo);
    res.json(updatedOrderInfo);

    let goods = updatedOrderInfo.items.map(item => {
      return {
        name: item.name,
        quantity: item.quantity,
        imageurl: products[item.imageurl],
        price: Number(item.price).toFixed(2),
        sub_total: Number(item.sub_total).toFixed(2),
      };
    });

    var replacements = {
      order_number: updatedOrderInfo.order_number,
      order_company: updatedOrderInfo.ship_company,
      order_date: moment(updatedOrderInfo.created)
        .tz('America/New_York')
        .format('MM/DD/YYYY hh:mm A z'),
      order_type:
        updatedOrderInfo.order_number.split('.')[1] === 'INV'
          ? 'Inventory'
          : updatedOrderInfo.order_number.split('.')[1] === 'DS'
            ? 'Direct Ship'
            : updatedOrderInfo.order_number.split('.')[1] === 'DSS'
              ? 'Direct Ship Store'
              : updatedOrderInfo.order_number.split('.')[1] === 'DEM'
                ? 'Demo'
                : 'Marketing',
      ship_name:
        updatedOrderInfo.ship_first_name +
        ' ' +
        updatedOrderInfo.ship_last_name,
      ship_address_1: updatedOrderInfo.ship_address_1,
      ship_address_2: updatedOrderInfo.ship_address_2,
      ship_city: updatedOrderInfo.ship_city,
      ship_state: updatedOrderInfo.ship_state,
      ship_zip: updatedOrderInfo.ship_zip,
      ship_phone: updatedOrderInfo.ship_phone,
      ship_email: updatedOrderInfo.ship_e_mail,
      payment_type: 'Mohawk Account',
      payment_status: 'Not Approved',
      mohawk_account: updatedOrderInfo.mohawk_account,
      subtotal: updatedOrderInfo.sub_total,
      items: goods,
      total: Number(
        parseFloat(updatedOrderInfo.sub_total) -
        parseFloat(updatedOrderInfo.discount)
      ).toFixed(2),
      discount: updatedOrderInfo.discount,
    };

    emailManager(
      __dirname + '/../../templates/NewDealerMohawkRejected.html',
      replacements,
      updatedOrderInfo.ship_e_mail,
      `Your Soniclean order(#: ${updatedOrderInfo.order_number}) has been Rejected`,
      null,
      null,
      () => {
        console.log('success-dealer-mohawk-order-rejected!');
      }
    );
  } catch (error) {
    res.status(400).json({ message: 'Oops! cannot find the order' });
  }
});

router.put('/reinstate/:id', async (req, res) => {
  // console.log(req.params.token);
  try {
    let orderInfo = await Orders.findById(req.params.id);
    orderInfo.mohawk_order_status = 'pending';
    let tokenInfo = await MohawkToken.findOne({
      _orderId: orderInfo._id,
    });
    orderInfo.save().then(updatedOrderInfo => {
      res.json(updatedOrderInfo);

      let goods = updatedOrderInfo.items.map(item => {
        return {
          name: item.name,
          quantity: item.quantity,
          imageurl: products[item.imageurl],
          price: Number(item.price).toFixed(2),
          sub_total: Number(item.sub_total).toFixed(2),
        };
      });

      var replacements = {
        order_number: updatedOrderInfo.order_number,
        order_company: updatedOrderInfo.ship_company,
        order_date: moment(updatedOrderInfo.created)
          .tz('America/New_York')
          .format('MM/DD/YYYY hh:mm A z'),
        order_type:
          updatedOrderInfo.order_number.split('.')[1] === 'INV'
            ? 'Inventory'
            : updatedOrderInfo.order_number.split('.')[1] === 'DS'
              ? 'Direct Ship'
              : updatedOrderInfo.order_number.split('.')[1] === 'DSS'
                ? 'Direct Ship Store'
                : updatedOrderInfo.order_number.split('.')[1] === 'DEM'
                  ? 'Demo'
                  : 'Marketing',
        ship_name:
          updatedOrderInfo.ship_first_name +
          ' ' +
          updatedOrderInfo.ship_last_name,
        ship_address_1: updatedOrderInfo.ship_address_1,
        ship_address_2: updatedOrderInfo.ship_address_2,
        ship_city: updatedOrderInfo.ship_city,
        ship_state: updatedOrderInfo.ship_state,
        ship_zip: updatedOrderInfo.ship_zip,
        ship_phone: updatedOrderInfo.ship_phone,
        ship_email: updatedOrderInfo.ship_e_mail,
        ship_country: updatedOrderInfo.ship_country,
        dealer_company: updatedOrderInfo.ship_company,
        dealer_phone: updatedOrderInfo.ship_phone,
        payment_type: 'Mohawk Account',
        payment_status: 'Pending',
        mohawk_account: updatedOrderInfo.mohawk_account,
        subtotal: updatedOrderInfo.sub_total,
        items: goods,
        total: Number(
          parseFloat(updatedOrderInfo.sub_total) -
          parseFloat(updatedOrderInfo.discount)
        ).toFixed(2),
        discount: updatedOrderInfo.discount,
        mohawk_token: tokenInfo.mohawkToken,
      };

      emailManager(
        __dirname + '/../../templates/NewSonicleanMohawkPending.html',
        replacements,
        process.env.NODE_ENV === 'production'
          ? require('../../config/keys').productionEmailAlias
          : require('../../config/keys').developmentEmail,
        `New Soniclean Order - ACTION REQUIRED - Order #${updatedOrderInfo.order_number}`,
        null,
        null,
        () => {
          console.log('success-soniclean-mohawk-pending!');
        }
      );
    });

    // res.json(orderInfo);
  } catch (error) {
    res.status(400).json({ message: 'Oops! cannot find the order' });
  }
});

router.get(
  '/livedealers',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const FIRSTPDT = 'DEMO-SFC7000';
    const SECONDPDT = 'DEMO-KSC7500';
    try {
      let orderinfo = await Orders.find({
        $or: [{ 'items.item': FIRSTPDT }, { 'items.item': SECONDPDT }],
      }).populate('createdBy');
      // var clean = orderinfo.filter((arr, index, self) =>
      //   index === self.findIndex((t) => (t.cust_ref !== arr.cust_ref)))

      res.json(orderinfo);
    } catch (error) {
      console.log(error);
    }
  }
);

router.post(
  '/addlivedealer',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // console.log(req.body);

    try {
      let dealeruser = req.body.vacuumAccount
        ? await User.findOne({
          vacuumAccount: req.body.vacuumAccount,
        })
        : await User.findOne({
          mohawkAccount: req.body.mohawkAccount,
        });
      if (dealeruser) {
        let p = await axios.post(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.city} ${req.body.us_state},USA&key=${keys.googleMapKey}`
        );
        let lat = await p.data.results[0].geometry.location.lat;
        let lng = await p.data.results[0].geometry.location.lng;

        let new_order = new Orders({
          order_number: 'DEMO_MANUAL.DEM',
          mohawk_account_number: req.body.vacuumAccount
            ? ''
            : req.body.mohawk_account,
          vacuum_account_number: req.body.vacuumAccount
            ? req.body.vacuumAccount
            : '',
          dealer_email: '',
          cc_emails: '',
          payment_type: '',
          order_status: 'shipped',
          sub_total: 0,
          discount: 0,
          ship_company: req.body.name,
          ship_first_name: '',
          ship_last_name: '',
          ship_address_1: req.body.address1,
          ship_address_2: req.body.address2,
          ship_city: req.body.city,
          ship_state: req.body.us_state,
          ship_zip: req.body.zipcode,
          ship_phone: req.body.phoneNumber,
          ship_e_mail: '',
          bill_company: '',
          bill_first_name: '',
          bill_last_name: '',
          bill_address_1: req.body.address1,
          bill_address_2: req.body.address2,
          bill_city: req.body.city,
          bill_state: req.body.us_state,
          bill_zip: req.body.zipcode,
          bill_phone: req.body.phoneNumber,
          bill_e_mail: '',
          created: new Date(),
          createdBy: dealeruser ? dealeruser._id : null,
          items: {
            item: 'DEMO-KSC7500',
            quantity: 1,
            name: 'Karastan Soft Carpet Upright Vacuum',
            model: '(Model: DEMO-KSC7500)',
            price: 175.0,
            imageurl: 'KSC_7500',
            discount: 0,
            sub_total: 175.0,
          },
          ship_store_lat: lat,
          ship_store_lng: lng,
        });

        let savedDealer = await new_order.save();

        res.json(savedDealer);
      } else {
        res.status(404).json({ messages: 'Dealer not found!' });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

router.put(
  '/livedealer/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let order = await Orders.findById(req.params.id).populate('createdBy');

    if (order) {
      order['ship_company'] = req.body.name;
      order['ship_address_1'] = req.body.address1;
      order['ship_address_2'] = req.body.address2;
      order['ship_city'] = req.body.city;
      order['ship_state'] = req.body.us_state;
      order['ship_zip'] = req.body.zipcode;
      order['ship_phone'] = req.body.phoneNumber;
      order['mohawk_account_number'] = req.body.mohawkAccount;
      let updatedOrder = await order.save();

      res.json(updatedOrder);
    }
  }
);

router.delete(
  '/livedealer/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let order = await Orders.findByIdAndRemove(req.params.id);

      if (order === null) {
        res.status(400).json({ message: 'Oops! cannot find the order' });
      } else {
        res.json(order);
      }
    } catch (error) {
      res.status(400).json({ message: 'Oops! cannot remove the order' });
    }
  }
);

// CRUD Apis for order notes-

router.post(
  '/notes/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Orders.findOne({ _id: req.params.id }).then(order => {
      if (order) {
        const noteObj = {
          note: req.body.note,
          created: new Date().toISOString(),
        };
        order.notes.push(noteObj);
        order.save().then(res.status(200).send(order.notes));
      }
    });
  }
);

router.get(
  '/getnotes/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Orders.findOne({ _id: req.params.id }).then(order => {
      if (order) res.status(200).send(order.notes);
    });
  }
);

router.put(
  '/updatenote/:id/:order',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Orders.findById(req.params.order).then(order => {
      const notefound = order.notes.id(req.params.id);
      if (notefound) {
        notefound.note = req.body.newNote;
        notefound.created = Date.now();
      } else {
        return res.status(404).json({ message: 'cannot find the note' });
      }

      order
        .save()
        .then(order => {
          res.json(order.notes);
        })
        .catch(err => console.log(err));
    });
  }
);

router.delete(
  '/deletenote/:id/:order',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    Orders.findById(req.params.order).then(order => {
      if (order.notes.id(req.params.id)) {
        order.notes.id(req.params.id).remove();
      } else {
        return res.status(404).json({ message: 'cannot find the note' });
      }

      order
        .save()
        .then(order => {
          res.json(order.notes);
        })
        .catch(err => console.log(err));
    });
  }
);

module.exports = router;
