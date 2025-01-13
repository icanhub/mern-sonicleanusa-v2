const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const passport = require('passport');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
var cors = require('cors');
const users = require('./routes/api/users');
const payment = require('./routes/api/payment');
const store = require('./routes/api/store');
const account = require('./routes/api/account');
const images = require('./routes/api/images');
const company = require('./routes/api/company');
const employee = require('./routes/api/employee');
const salesform = require('./routes/api/salesform');
const orders = require('./routes/api/orders');
const official = require('./routes/api/official');
const manager = require('./routes/api/manager');
const mhkinvoicefileupload = require('./routes/api/mhkinvoicefileupload');

const webhooks = require('./routes/api/webhooks.js');
const managerfileupload = require('./routes/api/managerfileupload.js');
const mohawkexcelupload = require('./routes/api/mohawkexcelupload.js');
const newdealerfileupload = require('./routes/api/newdealerfileupload.js');
const orderlistexcelupload = require('./routes/api/orderlistexcelupload.js');
const POinfofileupload = require('./routes/api/POinfofileupload.js');

const shipstation_salesform = require('./routes/shipstationApi/salesform');
const shipstation_orders = require('./routes/shipstationApi/orders');
const shipstation_POinfofileupload = require('./routes/shipstationApi/POinfofileupload.js');
const shipstation_mhkinvoicefileupload = require('./routes/shipstationApi/mhkinvoicefileupload');
const mhkpoupdate = require('./routes/shipstationApi/mhkPOUpdate');
const orderEdit = require('./routes/shipstationApi/orderEdit');
const ordersUpload = require('./routes/shipstationApi/totalorderupload');

const OrdersCollection = require('./models/Orders');
const products = require('./config/products');
const moment = require('moment-timezone');

const { shipStationSecret, isDSOrder } = require('./utils/helper');
const emailManager = require('./utils/emailmanager.js');
var cron = require('node-cron');

// console.log('server envv', process.env.NODE_ENV);
const app = express();
app.disable('x-powered-by');

const publicOptions = {
  origin: function(origin, callback) {
    callback(null, true);
  },
  methods: 'GET',
};

app.use(cors());
app.use('/public', cors(publicOptions));
// Bodyparser middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// DB Config
let db;
if (process.env.NODE_ENV === 'production') {
  db = process.env.MONGODB_URI || require('./config/keys').mongoProductionURI;
} else {
  db = process.env.MONGODB_URI || require('./config/keys').mongoDevelopmentURI;
}

// Connect to MongoDB
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
  })
  .then(() => console.log('MongoDB successfully connected'))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

// Routes
app.use('/api/users', users);
app.use('/api/payment', payment);
app.use('/api/store', store);
app.use('/api/account', account);
app.use('/api/images', images);
app.use('/api/company', company);
app.use('/api/employee', employee);
app.use('/api/salesform', salesform);
app.use('/api/orders', orders);
app.use('/api/official', official);
app.use('/api/manager', manager);
app.use('/api/mhkinvoicefileupload', mhkinvoicefileupload);
app.use('/api/managerfileupload', managerfileupload);
app.use('/api/mohawkexcelupload', mohawkexcelupload);
app.use('/api/newdealerfileupload', newdealerfileupload);
app.use('/api/orderlistexcelupload', orderlistexcelupload);
app.use('/api/poinfofileupload', POinfofileupload);

app.use('/shipstation-api/salesform', shipstation_salesform);
app.use('/shipstation-api/orders', shipstation_orders);
app.use('/shipstation-api/poinfofileupload', shipstation_POinfofileupload);
app.use(
  '/shipstation-api/mhkinvoicefileupload',
  shipstation_mhkinvoicefileupload
);
app.use('/shipstation-api/mhkpoupdate', mhkpoupdate);
app.use('/shipstation-api/order_edit', orderEdit);
app.use('/shipstation-api/ordersupload', ordersUpload);

app.use(express.static(path.join(__dirname, 'client/build')));
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 5000;

const server = http.createServer(app);

var request = require('request');

// var targetBaseURL = 'http://f345c5d1106e.ngrok.io';
// var targetDevURL = 'http://dev.dealers.sonicleanusa.com';
// var targetProURL = 'https://dealers.sonicleanusa.com';
const targetShipURL =
  process.env.NODE_ENV === 'production'
    ? 'https://dealers.sonicleanusa.com'
    : 'http://dev.dealers.sonicleanusa.com';

var options = {
  method: 'POST',
  url: 'https://ssapi.shipstation.com/webhooks/subscribe',
  headers: {
    Host: 'ssapi.shipstation.com',
    Authorization: shipStationSecret(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    target_url: `${targetShipURL}/shiporder`,
    event: 'SHIP_NOTIFY',
    store_id: '340339',
    friendly_name: 'My Webhook',
  }),
};
request(options, function(error, response) {
  if (error) throw new Error(error);
  // console.log(response.body);
});

// var request = require('request');
// var options = {
//   method: 'DELETE',
//   url: 'https://ssapi.shipstation.com/webhooks/6543',
//   headers: {
//     Host: 'ssapi.shipstation.com',
//     Authorization: shipStationSecret(),
//   },
// };
// request(options, function(error, response) {
//   if (error) throw new Error(error);
//   console.log(response.body);
// });

var request = require('request');
var options = {
  method: 'GET',
  url: 'https://ssapi.shipstation.com/webhooks',
  headers: {
    Host: 'ssapi.shipstation.com',
    Authorization: shipStationSecret(),
  },
};
request(options, function(error, response) {
  if (error) throw new Error(error);
  // console.log(response.body);
});

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Authorization'] = shipStationSecret();

app.post('/shiporder', async (req, res) => {
  console.log('inside ship order: ', req.body.resource_url);
  if (req.body.resource_url) {
    try {
      let response = await axios.get(req.body.resource_url);
      let data = await response.data;
      // console.log(data);
      if (data.shipments.length > 0) {
        Promise.all(
          data.shipments.map(async shipment => {
            // console.log(shipment.voided);
            if (!shipment.voided) {
              let shippedOrder = await OrdersCollection.findOne({
                order_key: shipment.orderKey,
              });
              if (!shippedOrder) {
                return;
              }

              if (shippedOrder.order_status !== 'shipped') {
                shippedOrder['order_status'] = 'shipped';
                shippedOrder['carrier_code'] = shipment.carrierCode;
                shippedOrder['tracking_number'] = shipment.trackingNumber;
                shippedOrder['shipped_date'] = shipment.shipDate;
                let updatedOrder = await shippedOrder.save();

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
                  order_date: moment(updatedOrder.created)
                    .tz('America/New_York')
                    .format('MM/DD/YYYY hh:mm A z'),
                  shipped_date: moment
                    .utc(updatedOrder.shipped_date)
                    .format('MM/DD/YYYY'),
                  payment_type:
                    updatedOrder.payment_type === 'mohawk'
                      ? 'Mohawk'
                      : updatedOrder.payment_type === 'freepaid'
                      ? 'No Charge'
                      : 'Credit/Debit Card',
                  order_type:
                    updatedOrder.order_number.split('.')[1] === 'INV'
                      ? 'Inventory'
                      : updatedOrder.order_number.split('.')[1] === 'DS'
                      ? 'Direct Ship'
                      : updatedOrder.order_number.split('.')[1] === 'DSS'
                      ? 'Direct Ship Store'
                      : updatedOrder.order_number.split('.')[1] === 'DEM'
                      ? 'Demo'
                      : 'Marketing',
                  ship_name:
                    updatedOrder.ship_first_name +
                    ' ' +
                    updatedOrder.ship_last_name,
                  ship_address_1: updatedOrder.ship_address_1,
                  ship_address_2: updatedOrder.ship_address_2,
                  ship_city: updatedOrder.ship_city,
                  ship_state: updatedOrder.ship_state,
                  ship_zip: updatedOrder.ship_zip,
                  ship_phone: updatedOrder.ship_phone,
                  ship_email: updatedOrder.ship_e_mail,
                  mohawk_account: updatedOrder.mohawk_account_number,
                  payment_status:
                    updatedOrder.payment_type === 'stripe'
                      ? 'Paid'
                      : updatedOrder.payment_type === 'freepaid'
                      ? 'No Charge'
                      : updatedOrder.mohawk_order_paid_date === undefined
                      ? 'Mohawk-Unpaid'
                      : 'Mohawk-Paid',
                  subtotal: Number(updatedOrder.sub_total).toFixed(2),
                  discount: Number(updatedOrder.discount).toFixed(2),
                  items: goods,
                  trackingNumberURL:
                    updatedOrder.carrier_code === 'fedex'
                      ? `https://www.fedex.com/apps/fedextrack/?tracknumbers=${updatedOrder.tracking_number}`
                      : `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${updatedOrder.tracking_number}`,
                  trackingNumber: updatedOrder.tracking_number,
                  total: Number(
                    Number(updatedOrder.sub_total) -
                      Number(updatedOrder.discount)
                  ).toFixed(2),
                };
                console.log('ship order updated');
                if (isDSOrder(updatedOrder.order_number)) {
                  emailManager(
                    __dirname +
                      '/./templates/NewCustomerShippingConfirmation.html',
                    replacements,
                    updatedOrder.ship_e_mail,
                    `Your Soniclean order(#: ${updatedOrder.order_number}) has shipped`,
                    null,
                    null,
                    () => {
                      console.log('Shipping-customer-email-success!');
                    }
                  );
                }
                emailManager(
                  __dirname + '/./templates/NewDealerShippingConfirmation.html',
                  replacements,
                  updatedOrder.cc_emails,
                  `Your Soniclean order(#: ${updatedOrder.order_number}) has shipped`,
                  null,
                  null,
                  () => {
                    console.log('Shipping-dealer-email-success!');
                  }
                );
                return updatedOrder;
              }
            } else {
              let shippedOrder = await OrdersCollection.findOne({
                order_key: shipment.orderKey,
              });
              if (!shippedOrder) {
                return;
              }
              if (shippedOrder.order_status === 'shipped') {
                shippedOrder['order_status'] = 'awaiting_shipment';
                shippedOrder['tracking_number'] = null;
                shippedOrder['shipped_date'] = null;
                let updatedOrder = await shippedOrder.save();
                return updatedOrder;
              }
            }
          })
        ).then(response => {
          console.log(response);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  // app.get('*', (req, res) => {
  //   res.sendFile(path.join(__dirname + '/client/public/index.html'));
  // });
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

server.listen(port, () =>
  console.log(`Server up and running on port ${port} !`)
);
