const express = require('express');
const router = express.Router();
const keys = require('../../config/keys');
const passport = require('passport');
const axios = require('axios');

const {
  shipStationSecret,
  getOrderName,
  getOrderType,
  getNextOrderNumber,
  isFreePaid,
  isMKTOrder,
  isDSOrder,
  isMohawkPaid,
  isDEMOrder,
} = require('../../utils/helper');

const stripe =
  process.env.NODE_ENV === 'production'
    ? require('stripe')(keys.stripeSecretKey)
    : require('stripe')(keys.stripeTestSecretKey);
// const stripe = require('stripe')(keys.stripeTestSecretKey);
const moment = require('moment-timezone');
const crypto = require('crypto');
const User = require('../../models/User');
const Orders = require('../../models/Orders');
const MohawkToken = require('../../models/MohawkToken');
const emailManager = require('../../utils/emailmanager.js');
const products = require('../../config/products');
const { userInfo } = require('os');

const baseURL = `https://ssapi.shipstation.com/orders`;

/* POST a payment method */

router.post(
  '/order/:dealer_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    ///////////////  getting the last order name  /////////////

    let orderInfo = req.body;
    // console.log('orderinfo->>>>', orderInfo);
    let order = orderInfo.order;
    let dealer_id = req.params.dealer_id;
    let next_order_name;
    if (process.env.NODE_ENV === 'production') {
      let last_order = await Orders.findOne()
        .sort({ created: 'desc' })
        .limit(1);
      let last_order_name = '10000';
      if (last_order) {
        last_order_name = getOrderName(last_order.order_number);
      }
      next_order_name = getNextOrderNumber(
        last_order_name,
        getOrderType(order.cust_ref)
      );
    } else {
      // next_order_name = order.cust_ref;
      // LOGIC modified for dev order number generation according to prod (Upper line uncomment - Below lines comment => For prev. logic)
      let last_order = await Orders.findOne()
        .sort({ created: 'desc' })
        .limit(1);
      let last_order_name = '10000';
      if (last_order) {
        last_order_name = getOrderName(last_order.order_number);
      }
      next_order_name = getNextOrderNumber(
        last_order_name,
        getOrderType(order.cust_ref)
      );
    }

    let total = Number(
      Number(orderInfo.amount) - Number(orderInfo.discount)
    ).toFixed(2);
    let subTotal = Number(orderInfo.amount).toFixed(2);
    let discount = Number(orderInfo.discount).toFixed(2);

    let cc_emails = orderInfo.selectedUsers.map(item => {
      return item['value'];
    });

    cc_emails.unshift(order.cust_e_mail);

    let lat = '';
    let lng = '';
    if (isDEMOrder(next_order_name)) {
      let p = await axios.post(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${order.ship_city} ${order.ship_state},USA&key=${keys.googleMapKey}`
      );
      lat = await p.data.results[0].geometry.location.lat;
      lng = await p.data.results[0].geometry.location.lng;
    }

    let shipStationData = {};
    shipStationData['orderNumber'] = next_order_name;
    shipStationData['orderDate'] = new Date();
    shipStationData['orderStatus'] = 'awaiting_shipment';
    shipStationData.billTo = {};
    shipStationData.shipTo = {};
    shipStationData['billTo'][
      'name'
    ] = `${order.cust_first_name} ${order.cust_last_name}`;
    shipStationData['billTo'][
      'company'
    ] = `${order.cust_company} (${orderInfo.mohawk_account})`;
    shipStationData['billTo']['street1'] = `${order.cust_address_1}`;
    shipStationData['billTo']['street2'] =
      order.cust_address_2 === undefined ? '' : `${order.cust_address_2}`;
    shipStationData['billTo']['city'] = `${order.cust_city}`;
    shipStationData['billTo']['state'] = `${order.cust_state}`;
    shipStationData['billTo']['postalCode'] = `${order.cust_zip}`;
    shipStationData['billTo']['phone'] = `${order.cust_phone}`;

    shipStationData['shipTo'][
      'name'
    ] = `${order.ship_first_name} ${order.ship_last_name}`;
    shipStationData['shipTo']['company'] =
      order.ship_company === undefined ? '' : `${order.ship_company}`;
    shipStationData['shipTo']['street1'] = `${order.ship_address_1}`;
    shipStationData['shipTo']['street2'] =
      order.ship_address_2 === undefined ? '' : `${order.ship_address_2}`;
    shipStationData['shipTo']['city'] = `${order.ship_city}`;
    shipStationData['shipTo']['state'] = `${order.ship_state}`;
    shipStationData['shipTo']['postalCode'] = `${order.ship_zip}`;
    shipStationData['shipTo']['phone'] = `${order.ship_phone}`;
    shipStationData['items'] = order.items.map(item => {
      return {
        sku: item.item,
        name: item.name,
        imageUrl: item.imageurl,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
      };
    });

    // console.log('orderInfo latest', orderInfo);
    // console.log('orderInfo name', next_order_name);
    let new_order = new Orders({
      order_number: next_order_name,
      mohawk_account_number: orderInfo.vacuumAccount
        ? ''
        : orderInfo.mohawk_account,
      vacuum_account_number: orderInfo.vacuumAccount
        ? orderInfo.vacuumAccount
        : '',
      dealer_email: order.cust_e_mail,
      cc_emails: cc_emails.toString(),
      payment_type: orderInfo.card,
      order_status: 'process',
      sub_total: subTotal,
      discount: discount,
      PO_number: orderInfo.order.PO_number,
      ship_company: order.ship_company,
      ship_first_name: order.ship_first_name,
      ship_last_name: order.ship_last_name,
      ship_address_1: order.ship_address_1,
      ship_address_2: order.ship_address_2,
      ship_city: order.ship_city,
      ship_state: order.ship_state,
      ship_zip: order.ship_zip,
      ship_phone: order.ship_phone,
      ship_e_mail: order.ship_e_mail,
      bill_company: order.cust_company,
      bill_first_name: order.cust_first_name,
      bill_last_name: order.cust_last_name,
      bill_address_1: order.cust_address_1,
      bill_address_2: order.cust_address_2,
      bill_city: order.cust_city,
      bill_state: order.cust_state,
      bill_zip: order.cust_zip,
      bill_phone: order.cust_phone,
      bill_e_mail: order.cust_e_mail,
      created: new Date(),
      createdBy: dealer_id,
      items: order.items,
      ship_store_lat: lat,
      ship_store_lng: lng,
    });

    let goods = order.items.map(item => {
      return {
        name: item.name,
        quantity: item.quantity,
        imageurl: products[item.imageurl],
        price: Number(item.price).toFixed(2),
        sub_total: Number(item.sub_total).toFixed(2),
      };
    });

    var replacements = {
      order_number: next_order_name,
      order_company: order.ship_company,
      order_date: moment(new Date())
        .tz('America/New_York')
        .format('MM/DD/YYYY hh:mm A z'),
      order_type:
        next_order_name.split('.')[1] === 'INV'
          ? 'Inventory'
          : next_order_name.split('.')[1] === 'DS'
            ? 'Direct Ship'
            : next_order_name.split('.')[1] === 'DSS'
              ? 'Direct Ship Store'
              : next_order_name.split('.')[1] === 'DEM'
                ? 'Demo'
                : 'Marketing',
      ship_name: order.ship_first_name + ' ' + order.ship_last_name,
      ship_address_1: order.ship_address_1,
      ship_address_2: order.ship_address_2,
      ship_city: order.ship_city,
      ship_state: order.ship_state,
      ship_zip: order.ship_zip,
      ship_phone: order.ship_phone,
      ship_email: order.ship_e_mail,
      mohawk_account: orderInfo.mohawk_account,
      subtotal: subTotal,
      items: goods,
      total: total,
      discount: discount,
    };

    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Authorization'] = shipStationSecret();

    if (isFreePaid(orderInfo.card)) {
      //////////// free-paid payment ///////////////
      replacements['payment_type'] = 'No Charge';
      replacements['payment_status'] = 'No Charge';
      try {
        let response = await axios.post(
          `${baseURL}/createorder`,
          shipStationData
        );
        const data = await response.data;

        new_order['order_Id'] = await data.orderId;
        new_order['order_key'] = await data.orderKey;
        new_order['order_status'] = await data.orderStatus;
        try {
          let createdOrder = await new_order.save();
          res.json(createdOrder);

          if (isMKTOrder(next_order_name)) {
            emailManager(
              __dirname + '/../../templates/NewSonicleanOrderConfirmation.html',
              replacements,
              process.env.NODE_ENV === 'production'
                ? require('../../config/keys').productionEmailAlias
                : require('../../config/keys').developmentEmail,
              `${next_order_name} ORDER - NEED TO FULFILL`,
              null,
              null,
              () => {
                console.log(
                  'success-MKT-Free-Paid-Order-Confirm-To-SonicleanUser!'
                );
              }
            );
          }

          if (isDSOrder(next_order_name)) {
            emailManager(
              __dirname + '/../../templates/NewCustomerOrderConfirmation.html',
              replacements,
              createdOrder.ship_e_mail,
              `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
              null,
              null,
              () => {
                console.log('success-DS-Order-Confirm-To-Customer!');
              }
            );
          }

          emailManager(
            __dirname + '/../../templates/NewDealerOrderConfirmation.html',
            replacements,
            cc_emails.toString(),
            `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
            null,
            null,
            () => {
              console.log('success-DS-Dealer!');
            }
          );
        } catch (error) {
          res
            .status(400)
            .json({ messages: 'Creating Order Failed in Database' });
        }
      } catch (error) {
        res
          .status(400)
          .json({ messages: 'Creating Order Failed in ShipStation' });
      }
    } else if (isMohawkPaid(orderInfo.card)) {
      //////////// mohawk payment ///////////////

      replacements['payment_type'] = 'Mohawk';
      replacements['payment_status'] = 'Pending';

      try {
        new_order['mohawk_order_status'] = 'pending';
        let createdOrder = await new_order.save();
        var newMohawkToken = new MohawkToken({
          _orderId: createdOrder._id,
          mohawkToken: crypto.randomBytes(16).toString('hex'),
        });
        try {
          let newToken = await newMohawkToken.save();
          res.json(createdOrder);

          replacements['mohawk_token'] = newToken.mohawkToken;
          emailManager(
            __dirname + '/../../templates/NewDealerMohawkPending.html',
            replacements,
            cc_emails.toString(),
            `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
            null,
            null,
            () => {
              console.log('success-Mohawk-Order-Confirm-To-Customer!');
            }
          );

          emailManager(
            __dirname + '/../../templates/NewSonicleanMohawkPending.html',
            replacements,
            process.env.NODE_ENV === 'production'
              ? require('../../config/keys').productionEmailAlias
              : require('../../config/keys').developmentEmail,
            `New Soniclean Order - ACTION REQUIRED - Order #${next_order_name}`,
            null,
            null,
            () => {
              console.log('success-Mohawk-Order-Confirm-To-SonicleanUser!');
            }
          );
        } catch (error) {
          res
            .status(400)
            .json({ messages: 'Creating Mohawk token Failed in Database' });
        }
      } catch (error) {
        res.status(400).json({ messages: 'Creating Order Failed in Database' });
      }
    } else {
      //////////// stripe card payment ///////////////
      replacements['payment_type'] = 'Credit/Debit Card';
      let user = await User.findById(dealer_id);
      //----------------------------------------------------------------------

      //----------------------------------------------------------------------

      // let selectedCard = await user.payments.id(orderInfo.card);

      // let token = await stripe.tokens.create({
      //   card: {
      //     number: await selectedCard.cardnumber,
      //     exp_month: await selectedCard.token.card.exp_month,
      //     exp_year: await selectedCard.token.card.exp_year,
      //     cvc: await selectedCard.cvc,
      //   },
      // });

      // let customer = await stripe.customers.create({
      //   name: order.ship_first_name + order.ship_last_name,
      //   email: user.email,
      //   source: await token.id,
      // });
      try {
        // let charge = await stripe.charges.create({
        //   amount: total * 100,
        //   currency: 'usd',
        //   customer: await customer.id,
        //   description: 'Soniclean Order',
        // });
        const paymentIntent = await stripe.paymentIntents.create({
          amount: total * 100,
          currency: 'usd',
          customer: user.stripe_customer_id,
          description: 'Soniclean Order',
          payment_method: orderInfo.card,
        });

        // console.log('payment Intent ->', paymentIntent);

        const paymentIntentConfirm = await stripe.paymentIntents.confirm(
          paymentIntent.id
        );

        // console.log('payment Intent Confirm->', paymentIntentConfirm);

        if (paymentIntentConfirm.charges.data[0].paid) {
          replacements['payment_status'] = 'Paid';
          try {
            let response = await axios.post(
              `${baseURL}/createorder`,
              shipStationData
            );
            const data = await response.data;
            new_order['payment_type'] = 'stripe';
            new_order['order_Id'] = await data.orderId;
            new_order['order_key'] = await data.orderKey;
            new_order['order_status'] = await data.orderStatus;
            try {
              // console.log('save ==========', new_order);
              let createdOrder = await new_order.save();
              // console.log('saved--------', createdOrder);
              res.json(createdOrder);
              // console.log('created order))))))))', createdOrder);

              if (isMKTOrder(next_order_name)) {
                emailManager(
                  __dirname + '/../../templates/NewSonicleanOrderConfirmation.html',
                  replacements,
                  process.env.NODE_ENV === 'production'
                    ? require('../../config/keys').productionEmailAlias
                    : require('../../config/keys').developmentEmail,
                  `${next_order_name} ORDER - NEED TO FULFILL`,
                  null,
                  null,
                  () => {
                    console.log(
                      'success-MKT-Stripe-Paid-Order-Confirm-To-SonicleanUser!'
                    );
                  }
                );
              }
              // console.log('beech me');
              if (isDSOrder(next_order_name)) {
                emailManager(
                  __dirname +
                  '/../../templates/NewCustomerOrderConfirmation.html',
                  replacements,
                  createdOrder.ship_e_mail,
                  `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
                  null,
                  null,
                  () => {
                    console.log('success-DS-Order-Confirm-To-Customer!');
                  }
                );
              }

              emailManager(
                __dirname + '/../../templates/NewDealerOrderConfirmation.html',
                replacements,
                cc_emails.toString(),
                `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
                null,
                null,
                () => {
                  console.log('success-DS-Dealer!');
                }
              );
            } catch (error) {
              res
                .status(400)
                .json({ messages: 'Creating Order Failed in Database' });
            }
          } catch (error) {
            console.log(error);
            res
              .status(400)
              .json({ messages: 'Creating Order Failed in ShipStation' });
          }
        }
      } catch (error) {
        res
          .status(400)
          .json({ messages: 'Cannot charge the amounts from stripe' });
      }
    }
  }
);

router.put(
  '/mohawkorder/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let orderData = await Orders.findById(req.params.id);
      // if (isMKTOrder(orderData.order_number)) {
      //   orderData['mohawk_order_status'] = 'released';

      //   let updatedOrder = await orderData.save();
      //   res.json(updatedOrder);
      // } else {
      let shipStationData = {};
      shipStationData['orderNumber'] = orderData.order_number;
      shipStationData['orderDate'] = new Date();
      shipStationData['orderStatus'] = 'awaiting_shipment';
      shipStationData.billTo = {};
      shipStationData.shipTo = {};
      shipStationData['billTo'][
        'name'
      ] = `${orderData.cust_first_name} ${orderData.cust_last_name}`;
      shipStationData['billTo']['company'] = `${orderData.cust_company}`;
      shipStationData['billTo']['street1'] = `${orderData.cust_address_1}`;
      shipStationData['billTo']['street2'] = `${orderData.cust_address_2}`;
      shipStationData['billTo']['city'] = `${orderData.cust_city}`;
      shipStationData['billTo']['state'] = `${orderData.cust_state}`;
      shipStationData['billTo']['postalCode'] = `${orderData.cust_zip}`;
      shipStationData['billTo']['phone'] = `${orderData.cust_phone}`;

      shipStationData['shipTo'][
        'name'
      ] = `${orderData.ship_first_name} ${orderData.ship_last_name}`;
      shipStationData['shipTo']['company'] = `${orderData.ship_company}`;
      shipStationData['shipTo']['street1'] = `${orderData.ship_address_1}`;
      shipStationData['shipTo']['street2'] = `${orderData.ship_address_2}`;
      shipStationData['shipTo']['city'] = `${orderData.ship_city}`;
      shipStationData['shipTo']['state'] = `${orderData.ship_state}`;
      shipStationData['shipTo']['postalCode'] = `${orderData.ship_zip}`;
      shipStationData['shipTo']['phone'] = `${orderData.ship_phone}`;
      shipStationData['items'] = orderData.items.map(item => {
        return {
          sku: item.item,
          name: item.name,
          imageUrl: item.imageurl,
          quantity: item.quantity,
          unitPrice: parseFloat(item.price),
        };
      });

      try {
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Authorization'] = shipStationSecret();
        let response = await axios.post(
          `${baseURL}/createorder`,
          shipStationData
        );
        const data = await response.data;
        orderData['order_Id'] = await data.orderId;
        orderData['order_key'] = await data.orderKey;
        orderData['order_status'] = await data.orderStatus;
        orderData['mohawk_order_status'] = 'released';

        let updatedOrder = await orderData.save();
        res.json(updatedOrder);
      } catch (error) { }
      // }
    } catch (error) {
      res.status(400).json({ messages: 'Cannot find the order from database' });
    }
  }
);

module.exports = router;
