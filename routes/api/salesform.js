const express = require('express');
const router = express.Router();
const keys = require('../../config/keys');
const passport = require('passport');
const axios = require('axios');
const stripe = process.env.NODE_ENV === 'production' ? require('stripe')(keys.stripeSecretKey) : require('stripe')(keys.stripeTestSecretKey);
// const stripe = require('stripe')(keys.stripeTestSecretKey);
const moment = require('moment-timezone');
const crypto = require('crypto');
const User = require('../../models/User');
const Orders = require('../../models/Orders');
const MohawkToken = require('../../models/MohawkToken');
const emailManager = require('../../utils/emailmanager.js');
const products = require('../../config/products');
var handlebars = require('handlebars');
var fs = require('fs');
/* POST a payment method */

router.put(
  '/mohawkorder/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let response = await axios.post(
      `https://api.cartrover.com/v1/cart/orders/cartrover?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`,
      req.body
    );
    let data = await response.data;
    let order = await Orders.findById(req.params.id);
    order.success_code = data.success_code;
    order.cust_ref = data.cust_ref;
    order.order_number = data.order_number;
    order.order_status = data.success_code ? 'In Process' : '';
    order.mohawk_status = 'released';
    order.save().then(updatedOrder => {
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

      let total = Number(
        Number(updatedOrder.sub_total) - Number(updatedOrder.discount)
      ).toFixed(2);
      let subTotal = Number(updatedOrder.sub_total).toFixed(2);
      let discount = Number(updatedOrder.discount).toFixed(2);

      var replacements = {
        order_number: updatedOrder.order_number,
        order_company: updatedOrder.ship_company,
        order_date: moment(updatedOrder.created)
          .tz('America/New_York')
          .format('MM/DD/YYYY hh:mm A z'),
        payment_status: 'Released',
        order_type: 'Mohawk Account',
        ship_name:
          updatedOrder.ship_first_name + ' ' + updatedOrder.ship_last_name,
        ship_address_1: updatedOrder.ship_address_1,
        ship_address_2: updatedOrder.ship_address_2,
        ship_city: updatedOrder.ship_city,
        ship_state: updatedOrder.ship_state,
        ship_zip: updatedOrder.ship_zip,
        ship_phone: updatedOrder.ship_phone,
        ship_email: updatedOrder.ship_e_mail,
        mohawk_account: updatedOrder.mohawk_account,
        subtotal: subTotal,
        items: goods,
        total: total,
        discount: discount,
      };

      // emailManager(
      //   __dirname + '/../../templates/NewDealerOrderConfirmation.html',
      //   replacements,
      //   'wonder.dev21@gmail.com',
      //   `Your Soniclean order(#: ${updatedOrder.order_number}) has been confirmed`,
      //   null,
      //   () => {
      //     console.log('success-Mohawk-Order-Confirm-Dealer!');
      //   }
      // );
    });
  }
);
router.post(
  '/order/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    ///////////////  getting the last order name  /////////////
    let last_order = await Orders.findOne()
      .sort('-createdAt')
      .limit(1);
    let last_order_name = await last_order.cust_ref.split('.')[0];

    let next_order_name =
      (Number(last_order_name) + 1).toString() +
      '.' +
      req.body.order.cust_ref.split('.')[1];

    let order_info = req.body.order;
    order_info.cust_ref = next_order_name;

    // console.log(order_info);

    // console.log(req.body);

    let total = Number(
      Number(req.body.amount) - Number(req.body.discount)
    ).toFixed(2);
    let subTotal = Number(req.body.amount).toFixed(2);
    let discount = Number(req.body.discount).toFixed(2);

    // console.log(total, subTotal, discount);

    //////////////// WHEN ORDERTYPE IS MKT /////////////////////
    if (next_order_name.split('.')[1] === 'MKT') {
      let targetEmails = req.body.selectedUsers.map(item => {
        return item['value'];
      });

      ////////////////   Via credit/debit card for MKT order     ////////////////////
      if (req.body.card !== 'mohawk' && req.body.card !== 'No Charge') {
        User.findById(req.params.id).then(user => {
          let selectedCard = user.payments.id(req.body.card);
          stripe.tokens
            .create({
              card: {
                number: selectedCard.cardnumber,
                exp_month: selectedCard.token.card.exp_month,
                exp_year: selectedCard.token.card.exp_year,
                cvc: selectedCard.cvc,
              },
            })
            .then(token => {
              try {
                stripe.customers
                  .create({
                    name:
                      req.body.order.ship_first_name +
                      req.body.order.ship_last_name,
                    email: user.email,
                    source: token.id,
                  })
                  .then(customer => {
                    stripe.charges
                      .create({
                        amount: total * 100,
                        currency: 'usd',
                        customer: customer.id,
                        description: 'Soniclean Order',
                      })
                      .then(async charges => {
                        targetEmails.unshift(req.body.order.cust_e_mail);
                        const order_mkt = new Orders({
                          payment_type:
                            req.body.card === 'mohawk' ? 'mohawk' : 'stripe',
                          mohawk_account: req.body.mohawk_account,
                          success_code: true,
                          cust_ref: next_order_name,
                          order_number: next_order_name,
                          createdBy: req.params.id,
                          orderEmails: targetEmails.toString(),
                          order_status: 'In Process',
                          discount: discount,
                          mkt_trackingnumber: '',
                          dealeremail: req.body.cust_e_mail,
                          ship_company: req.body.order.ship_company,
                          sub_total: subTotal.toString(),
                          ship_first_name: req.body.order.ship_first_name,
                          ship_last_name: req.body.order.ship_last_name,
                          ship_address_1: req.body.order.ship_address_1,
                          ship_address_2: req.body.order.ship_address_2,
                          ship_city: req.body.order.ship_city,
                          ship_state: req.body.order.ship_state,
                          ship_zip: req.body.order.ship_zip,
                          ship_phone: req.body.order.ship_phone,
                          ship_e_mail: req.body.order.ship_e_mail,
                          trackingNumber: '',
                          items: req.body.order.items,
                        });

                        order_mkt.save().then(orderData => {
                          res.json(orderData);
                          ////////////// MKT-Order Dealer Email dealers@sonicleanusa.com order fullfill ///////////////
                          let goods = orderData.items.map(item => {
                            return {
                              name: item.name,
                              quantity: item.quantity,
                              imageurl: products[item.imageurl],
                              price: Number(item.price).toFixed(2),
                              sub_total: Number(item.sub_total).toFixed(2),
                            };
                          });

                          var replacements_fullfill = {
                            order_number: orderData.cust_ref,
                            order_company: orderData.ship_company,
                            order_date: moment(orderData.created)
                              .tz('America/New_York')
                              .format('MM/DD/YYYY hh:mm A z'),
                            ship_name:
                              orderData.ship_first_name +
                              ' ' +
                              orderData.ship_last_name,
                            ship_address_1: orderData.ship_address_1,
                            ship_address_2: orderData.ship_address_2,
                            ship_city: orderData.ship_city,
                            ship_state: orderData.ship_state,
                            ship_zip: orderData.ship_zip,
                            ship_email: orderData.orderEmails,
                            ship_phone: orderData.ship_phone,
                            payment_type: 'VISA',
                            payment_status: 'Paid',
                            order_type: 'Marketing',
                            mohawk_account: req.body.mohawk_account,
                            subtotal: subTotal,
                            items: goods,
                            total: total,
                            discount: discount,
                          };

                          emailManager(
                            __dirname +
                              '/../../templates/NewSonicleanOrderConfirmation.html',
                            replacements_fullfill,
                            process.env.NODE_ENV === 'production'
                              ? require('../../config/keys').productionEmailAlias
                              : require('../../config/keys').developmentEmail,
                            `${next_order_name}ORDER - NEED TO FULFILL`,
                            null,
                            null,
                            () => {
                              console.log('success-MKT-OrderConfirm Fulfill!');
                            }
                          );

                          ////////////// MKT-Order Dealer Email Order Confirm ///////////////

                          var replacements = {
                            order_number: next_order_name,
                            order_company: orderData.ship_company,
                            order_date: moment(orderData.created)
                              .tz('America/New_York')
                              .format('MM/DD/YYYY hh:mm A z'),
                            payment_type: 'VISA',
                            order_type: 'Marketing',
                            ship_name:
                              req.body.order.ship_first_name +
                              ' ' +
                              req.body.order.ship_last_name,
                            ship_address_1: req.body.order.ship_address_1,
                            ship_address_2: req.body.order.ship_address_2,
                            ship_city: req.body.order.ship_city,
                            ship_state: req.body.order.ship_state,
                            ship_zip: req.body.order.ship_zip,
                            ship_phone: req.body.order.ship_phone,
                            ship_email: req.body.order.ship_e_mail,
                            mohawk_account: req.body.mohawk_account,
                            payment_status: 'Paid',
                            subtotal: subTotal,
                            items: goods,
                            total: total,
                            discount: discount,
                          };

                          emailManager(
                            __dirname +
                            '/../../templates/NewDealerOrderConfirmation.html',
                            replacements,
                            targetEmails.toString(),
                            `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
                            null,
                            null,
                            () => {
                              console.log('success-MKT-Order-Confirm-Dealer!');
                            }
                          );
                        });
                      });
                  });
              } catch (e) { }
            });
        });
      }
      ////////////////////     via MKT order free-paid     ///////////////////
      else if (req.body.card === 'No Charge') {
        targetEmails.unshift(req.body.order.cust_e_mail);
        const order_mkt = new Orders({
          payment_type: 'No Charge',
          mohawk_account: req.body.mohawk_account,
          success_code: true,
          cust_ref: next_order_name,
          order_number: next_order_name,
          createdBy: req.params.id,
          orderEmails: targetEmails.toString(),
          order_status: 'In Process',
          discount: subTotal,
          mkt_trackingnumber: '',
          dealeremail: req.body.cust_e_mail,
          ship_company: req.body.order.ship_company,
          sub_total: subTotal.toString(),
          ship_first_name: req.body.order.ship_first_name,
          ship_last_name: req.body.order.ship_last_name,
          ship_address_1: req.body.order.ship_address_1,
          ship_address_2: req.body.order.ship_address_2,
          ship_city: req.body.order.ship_city,
          ship_state: req.body.order.ship_state,
          ship_zip: req.body.order.ship_zip,
          ship_phone: req.body.order.ship_phone,
          ship_e_mail: req.body.order.ship_e_mail,
          trackingNumber: '',
          items: req.body.order.items,
        });

        order_mkt.save().then(orderData => {
          res.json(orderData);
          ////////////// MKT-Order Dealer Email dealers@sonicleanusa.com order fullfill ///////////////
          let goods = orderData.items.map(item => {
            return {
              name: item.name,
              quantity: item.quantity,
              imageurl: products[item.imageurl],
              price: Number(item.price).toFixed(2),
              sub_total: Number(item.sub_total).toFixed(2),
            };
          });

          var replacements_fullfill = {
            order_number: orderData.cust_ref,
            order_company: orderData.ship_company,
            order_date: moment(orderData.created)
              .tz('America/New_York')
              .format('MM/DD/YYYY hh:mm A z'),
            ship_name:
              orderData.ship_first_name + ' ' + orderData.ship_last_name,
            ship_address_1: orderData.ship_address_1,
            ship_address_2: orderData.ship_address_2,
            ship_city: orderData.ship_city,
            ship_state: orderData.ship_state,
            ship_zip: orderData.ship_zip,
            ship_email: orderData.orderEmails,
            ship_phone: orderData.ship_phone,
            payment_type: 'No Charge',
            payment_status: 'No Charge',
            order_type: 'Marketing',
            mohawk_account: req.body.mohawk_account,
            subtotal: subTotal,
            items: goods,
            total: '0.00',
            discount: subTotal,
          };

          emailManager(
            __dirname + '/../../templates/NewSonicleanOrderConfirmation.html',
            replacements_fullfill,
            process.env.NODE_ENV === 'production'
              ? require('../../config/keys').productionEmailAlias
              : require('../../config/keys').developmentEmail,
            `${next_order_name} ORDER - NEED TO FULFILL`,
            null,
            null,
            () => {
              console.log('success-MKT-OrderConfirm!');
            }
          );

          ////////////// MKT-Order Dealer Email Order Confirm ///////////////

          var replacements = {
            order_number: next_order_name,
            order_company: orderData.ship_company,
            order_date: moment(orderData.created)
              .tz('America/New_York')
              .format('MM/DD/YYYY hh:mm A z'),
            payment_type: 'No Charge',
            order_type: 'Marketing',
            ship_name:
              req.body.order.ship_first_name +
              ' ' +
              req.body.order.ship_last_name,
            ship_address_1: req.body.order.ship_address_1,
            ship_address_2: req.body.order.ship_address_2,
            ship_city: req.body.order.ship_city,
            ship_state: req.body.order.ship_state,
            ship_zip: req.body.order.ship_zip,
            ship_phone: req.body.order.ship_phone,
            ship_email: req.body.order.ship_e_mail,
            mohawk_account: req.body.mohawk_account,
            payment_status: 'Free-Paid',
            subtotal: subTotal,
            items: goods,
            total: total,
            discount: discount,
          };

          emailManager(
            __dirname + '/../../templates/NewDealerOrderConfirmation.html',
            replacements,
            targetEmails.toString(),
            `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
            null,
            null,
            () => {
              console.log('success-MKT-Order-Confirm-Dealer!');
            }
          );
        });
      }
      ////////////////////     via Mohawk for MKT Order     ///////////////////
      else {
        targetEmails.unshift(req.body.order.cust_e_mail);
        const order_mkt = new Orders({
          payment_type: req.body.card === 'mohawk' ? 'mohawk' : 'stripe',
          mohawk_account: req.body.mohawk_account,
          success_code: true,
          cust_ref: next_order_name,
          order_number: next_order_name,
          createdBy: req.params.id,
          orderEmails: targetEmails.toString(),
          order_status: 'In Process',
          discount: discount,
          mkt_trackingnumber: '',
          dealeremail: req.body.cust_e_mail,
          ship_company: req.body.order.ship_company,
          sub_total: subTotal.toString(),
          ship_first_name: req.body.order.ship_first_name,
          ship_last_name: req.body.order.ship_last_name,
          ship_address_1: req.body.order.ship_address_1,
          ship_address_2: req.body.order.ship_address_2,
          ship_city: req.body.order.ship_city,
          ship_state: req.body.order.ship_state,
          ship_zip: req.body.order.ship_zip,
          ship_phone: req.body.order.ship_phone,
          ship_e_mail: req.body.order.ship_e_mail,
          trackingNumber: '',
          items: req.body.order.items,
          mohawk_status: 'pending',
          mohawk_sharing_token: '',
        });
        let mktOrder = await order_mkt.save();
        var newMohawkToken = new MohawkToken({
          _orderId: mktOrder._id,
          mohawkToken: crypto.randomBytes(16).toString('hex'),
        });

        let newToken = await newMohawkToken.save();

        res.json(mktOrder);
      }
    }
    ////////////////// WHEN ORDERTYPE IS INV, DEMO, DS, DSS /////////////////////
    else {
      //////////////   VIA Mohawk Type for INV, DEMO, DS, DSS-Order  ///////////////
      if (req.body.card === 'mohawk') {
        ///////////// via Mohawk Account ///////////////
        let targetDealerEmails = req.body.selectedUsers.map(item => {
          return item['value'];
        });
        targetDealerEmails.unshift(req.body.order.cust_e_mail);
        const order_mkt = new Orders({
          payment_type: req.body.card === 'mohawk' ? 'mohawk' : 'stripe',
          mohawk_account: req.body.mohawk_account,
          success_code: true,
          cust_ref: next_order_name,
          order_number: next_order_name,
          createdBy: req.params.id,
          orderEmails: targetDealerEmails.toString(),
          order_status: 'In Process',
          discount: discount,
          mkt_trackingnumber: '',
          dealeremail: req.body.cust_e_mail,
          ship_company: req.body.order.ship_company,
          sub_total: subTotal.toString(),
          ship_first_name: req.body.order.ship_first_name,
          ship_last_name: req.body.order.ship_last_name,
          ship_address_1: req.body.order.ship_address_1,
          ship_address_2: req.body.order.ship_address_2,
          ship_city: req.body.order.ship_city,
          ship_state: req.body.order.ship_state,
          ship_zip: req.body.order.ship_zip,
          ship_phone: req.body.order.ship_phone,
          ship_e_mail: req.body.order.ship_e_mail,
          trackingNumber: '',
          items: req.body.order.items,
          mohawk_status: 'pending',
          mohawk_sharing_token: '',
        });
        let mktOrder = await order_mkt.save();
        var newMohawkToken = new MohawkToken({
          _orderId: mktOrder._id,
          mohawkToken: crypto.randomBytes(16).toString('hex'),
        });

        let newToken = await newMohawkToken.save();

        let goods = mktOrder.items.map(item => {
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
          order_company: req.body.order.cust_company,
          order_date: moment(mktOrder.created)
            .tz('America/New_York')
            .format('MM/DD/YYYY hh:mm A z'),
          order_type:
            next_order_name.split('.')[1] === 'INV'
              ? 'Inventory'
              : next_order_name.split('.')[1] === 'DS' ||
                next_order_name.split('.')[1] === 'DSS'
                ? 'Direct Ship'
                : next_order_name.split('.')[1] === 'DEM'
                  ? 'Demo'
                  : 'Other',
          ship_name:
            req.body.order.ship_first_name +
            ' ' +
            req.body.order.ship_last_name,
          ship_address_1: req.body.order.ship_address_1,
          ship_address_2: req.body.order.ship_address_2,
          ship_city: req.body.order.ship_city,
          ship_state: req.body.order.ship_state,
          ship_zip: req.body.order.ship_zip,
          ship_phone: req.body.order.ship_phone,
          ship_email: req.body.order.ship_e_mail,
          ship_country: req.body.order.ship_country,
          dealer_company: req.body.order.cust_company,
          dealer_phone: req.body.order.cust_phone,
          payment_type: 'Mohawk Account',
          payment_status: 'Pending',
          mohawk_account: req.body.mohawk_account,
          subtotal: subTotal,
          items: goods,
          total: total,
          discount: discount,
          mohawk_token: newToken.mohawkToken,
        };

        emailManager(
          __dirname + '/../../templates/NewDealerMohawkPending.html',
          replacements,
          mktOrder.orderEmails,
          `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
          null,
          null,
          () => {
            console.log('success-DS-Customer!');
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
            console.log('success-DS-Customer!');
          }
        );

        console.log(newToken);

        res.json(mktOrder);
      }
      //////////////   VIA FREE-PAID for INV, DEMO, DS, DSS-Order  ///////////////
      else if (req.body.card === 'No Charge') {
        try {
          let response = await axios.post(
            `https://api.cartrover.com/v1/cart/orders/cartrover?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`,
            order_info
          );
          let data = await response.data;
          if (data.success_code) {
            let targetDealerEmails = req.body.selectedUsers.map(item => {
              return item['value'];
            });
            targetDealerEmails.unshift(req.body.order.cust_e_mail);
            let lat = '';
            let lng = '';
            if (next_order_name.split('.')[1] === 'DEM') {
              let p = await axios.post(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.order.ship_city} ${req.body.order.ship_state},USA&key=${keys.googleMapKey}`
              );
              lat = await p.data.results[0].geometry.location.lat;
              lng = await p.data.results[0].geometry.location.lng;
            }
            const order = new Orders({
              payment_type: 'No Charge',
              mohawk_account: req.body.mohawk_account,
              success_code: data.success_code,
              cust_ref: data.cust_ref,
              order_number: data.order_number,
              createdBy: req.params.id,
              orderEmails: targetDealerEmails.toString(),
              order_status: 'In Process',
              dealeremail: req.body.cust_e_mail,
              ship_company: req.body.order.ship_company,
              sub_total: subTotal.toString(),
              ship_first_name: req.body.order.ship_first_name,
              ship_last_name: req.body.order.ship_last_name,
              ship_address_1: req.body.order.ship_address_1,
              ship_address_2: req.body.order.ship_address_2,
              ship_city: req.body.order.ship_city,
              ship_state: req.body.order.ship_state,
              ship_zip: req.body.order.ship_zip,
              ship_phone: req.body.order.ship_phone,
              ship_e_mail: req.body.order.ship_e_mail,
              trackingNumber: '',
              items: req.body.order.items,
              ship_store_lat:
                next_order_name.split('.')[1] === 'DEM' ? lat : '',
              ship_store_lng:
                next_order_name.split('.')[1] === 'DEM' ? lng : '',
              discount: subTotal,
            });
            order.save().then(orderData => {
              res.json(orderData);
              ////////////// DS-Order Customer Email Order Confirm for Free-Paid ///////////////
              let goods = orderData.items.map(item => {
                return {
                  name: item.name,
                  quantity: item.quantity,
                  imageurl: products[item.imageurl],
                  price: Number(item.price).toFixed(2),
                  sub_total: Number(item.sub_total).toFixed(2),
                };
              });
              if (next_order_name.split('.')[1] === 'DS') {
                var replacements_customer = {
                  order_number: next_order_name,
                  order_company: req.body.order.cust_company,
                  order_date: moment(orderData.created)
                    .tz('America/New_York')
                    .format('MM/DD/YYYY hh:mm A z'),
                  order_type:
                    next_order_name.split('.')[1] === 'INV'
                      ? 'Inventory'
                      : next_order_name.split('.')[1] === 'DS' ||
                        next_order_name.split('.')[1] === 'DSS'
                        ? 'Direct Ship'
                        : next_order_name.split('.')[1] === 'DEM'
                          ? 'Demo'
                          : 'Other',
                  ship_name:
                    req.body.order.ship_first_name +
                    ' ' +
                    req.body.order.ship_last_name,
                  ship_address_1: req.body.order.ship_address_1,
                  ship_address_2: req.body.order.ship_address_2,
                  ship_city: req.body.order.ship_city,
                  ship_state: req.body.order.ship_state,
                  ship_zip: req.body.order.ship_zip,
                  ship_phone: req.body.order.ship_phone,
                  ship_email: req.body.order.ship_e_mail,
                  ship_country: req.body.order.ship_country,
                  dealer_company: req.body.order.cust_company,
                  dealer_phone: req.body.order.cust_phone,
                  items: goods,
                };

                emailManager(
                  __dirname +
                  '/../../templates/NewCustomerOrderConfirmation.html',
                  replacements_customer,
                  req.body.order.ship_e_mail,
                  `Your Soniclean order(#: ${data.cust_ref}) has been confirmed`,
                  null,
                  null,
                  () => {
                    console.log('success-DS-Customer!');
                  }
                );

                var replacements = {
                  order_number: next_order_name,
                  order_company: orderData.ship_company,
                  order_date: moment(orderData.created)
                    .tz('America/New_York')
                    .format('MM/DD/YYYY hh:mm A z'),
                  payment_type: 'No Charge',
                  order_type:
                    next_order_name.split('.')[1] === 'INV'
                      ? 'Inventory'
                      : next_order_name.split('.')[1] === 'DS' ||
                        next_order_name.split('.')[1] === 'DSS'
                        ? 'Direct Ship'
                        : next_order_name.split('.')[1] === 'DEM'
                          ? 'Demo'
                          : 'Other',
                  ship_name:
                    req.body.order.ship_first_name +
                    ' ' +
                    req.body.order.ship_last_name,
                  ship_address_1: req.body.order.ship_address_1,
                  ship_address_2: req.body.order.ship_address_2,
                  ship_city: req.body.order.ship_city,
                  ship_state: req.body.order.ship_state,
                  ship_zip: req.body.order.ship_zip,
                  ship_phone: req.body.order.ship_phone,
                  ship_email: req.body.order.ship_e_mail,
                  mohawk_account: req.body.mohawk_account,
                  payment_status: 'Free-Paid',
                  subtotal: subTotal,
                  items: goods,
                  total: '0.00',
                  discount: subTotal,
                };
                let targetDealerEmails = req.body.selectedUsers.map(item => {
                  return item['value'];
                });
                targetDealerEmails.unshift(req.body.order.cust_e_mail);
                emailManager(
                  __dirname +
                  '/../../templates/NewDealerOrderConfirmation.html',
                  replacements,
                  targetDealerEmails.toString(),
                  `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
                  null,
                  null,
                  () => {
                    console.log('success-DS-Dealer!');
                  }
                );

                // pdf
                //   .create(htmlToSend, options)
                //   .toFile(
                //     __dirname +
                //       '/../../public/invoicefiles/' +
                //       next_order_name +
                //       '.pdf',
                //     function(err, res) {
                //       if (err) return console.log(err);
                //       console.log(res); // { filename: '/app/businesscard.pdf' }

                //     }
                //   );
              }

              ////////////// INV, DEMO, DSS-Order Dealer Email Order Confirm for free-paid ///////////////
              else {
                var replacements = {
                  order_number: next_order_name,
                  order_company: orderData.ship_company,
                  order_date: moment(orderData.created)
                    .tz('America/New_York')
                    .format('MM/DD/YYYY hh:mm A z'),
                  payment_type: 'No Charge',
                  order_type:
                    next_order_name.split('.')[1] === 'INV'
                      ? 'Inventory'
                      : next_order_name.split('.')[1] === 'DS' ||
                        next_order_name.split('.')[1] === 'DSS'
                        ? 'Direct Ship'
                        : next_order_name.split('.')[1] === 'DEM'
                          ? 'Demo'
                          : 'Other',
                  ship_name:
                    req.body.order.ship_first_name +
                    ' ' +
                    req.body.order.ship_last_name,
                  ship_address_1: req.body.order.ship_address_1,
                  ship_address_2: req.body.order.ship_address_2,
                  ship_city: req.body.order.ship_city,
                  ship_state: req.body.order.ship_state,
                  ship_zip: req.body.order.ship_zip,
                  ship_phone: req.body.order.ship_phone,
                  ship_email: req.body.order.ship_e_mail,
                  ship_country: req.body.order.ship_country,
                  mohawk_account: req.body.mohawk_account,
                  payment_status: 'Free-Paid',
                  subtotal: subTotal,
                  items: goods,
                  total: '0.00',
                  discount: subTotal,
                };
                let targetDealerEmails = req.body.selectedUsers.map(item => {
                  return item['value'];
                });
                targetDealerEmails.unshift(req.body.order.cust_e_mail);
                emailManager(
                  __dirname +
                  '/../../templates/NewDealerOrderConfirmation.html',
                  replacements,
                  targetDealerEmails.toString(),
                  `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
                  null,
                  null,
                  () => {
                    console.log('success-IVN-Dealer!');
                  }
                );
              }
            });
          } else {
            res.status(400).json(data.message);
          }
        } catch (e) {
          return res.status(400).json({ message: 'Failed to send order' });
        }
      }
      ///////////// via credit card for INV, DEM, DS, DSS orders  ///////////////
      else {
        User.findById(req.params.id).then(user => {
          let selectedCard = user.payments.id(req.body.card);
          stripe.tokens
            .create({
              card: {
                number: selectedCard.cardnumber,
                exp_month: selectedCard.token.card.exp_month,
                exp_year: selectedCard.token.card.exp_year,
                cvc: selectedCard.cvc,
              },
            })
            .then(token => {
              try {
                stripe.customers
                  .create({
                    name:
                      req.body.order.ship_first_name +
                      req.body.order.ship_last_name,
                    email: user.email,
                    source: token.id,
                  })
                  .then(customer => {
                    stripe.charges
                      .create({
                        amount: total * 100,
                        currency: 'usd',
                        customer: customer.id,
                        description: 'Soniclean Order',
                      })
                      .then(async charges => {
                        try {
                          let response = await axios.post(
                            `https://api.cartrover.com/v1/cart/orders/cartrover?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`,
                            order_info
                          );
                          let data = await response.data;

                          if (data.success_code) {
                            let targetDealerEmails = req.body.selectedUsers.map(
                              item => {
                                return item['value'];
                              }
                            );

                            targetDealerEmails.unshift(
                              req.body.order.cust_e_mail
                            );

                            let lat = '';
                            let lng = '';
                            if (next_order_name.split('.')[1] === 'DEM') {
                              let p = await axios.post(
                                `https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.order.ship_city} ${req.body.order.ship_state},USA&key=${keys.googleMapKey}`
                              );
                              lat = await p.data.results[0].geometry.location
                                .lat;
                              lng = await p.data.results[0].geometry.location
                                .lng;
                            }

                            const order = new Orders({
                              payment_type: 'stripe',
                              mohawk_account: req.body.mohawk_account,
                              success_code: data.success_code,
                              cust_ref: data.cust_ref,
                              order_number: data.order_number,
                              createdBy: req.params.id,
                              orderEmails: targetDealerEmails.toString(),
                              order_status: 'In Process',
                              dealeremail: req.body.cust_e_mail,
                              ship_company: req.body.order.ship_company,
                              sub_total: subTotal.toString(),
                              ship_first_name: req.body.order.ship_first_name,
                              ship_last_name: req.body.order.ship_last_name,
                              ship_address_1: req.body.order.ship_address_1,
                              ship_address_2: req.body.order.ship_address_2,
                              ship_city: req.body.order.ship_city,
                              ship_state: req.body.order.ship_state,
                              ship_zip: req.body.order.ship_zip,
                              ship_phone: req.body.order.ship_phone,
                              ship_e_mail: req.body.order.ship_e_mail,
                              trackingNumber: '',
                              items: req.body.order.items,
                              ship_store_lat:
                                next_order_name.split('.')[1] === 'DEM'
                                  ? lat
                                  : '',
                              ship_store_lng:
                                next_order_name.split('.')[1] === 'DEM'
                                  ? lng
                                  : '',
                              discount: discount,
                            });

                            order.save().then(orderData => {
                              res.json(orderData);

                              let goods = orderData.items.map(item => {
                                return {
                                  name: item.name,
                                  quantity: item.quantity,
                                  imageurl: products[item.imageurl],
                                  price: Number(item.price).toFixed(2),
                                  sub_total: Number(item.sub_total).toFixed(2),
                                };
                              });

                              if (next_order_name.split('.')[1] === 'DS') {
                                ////////////// DS-Order Customer Email Order Confirm ///////////////

                                var replacements_customer = {
                                  order_number: next_order_name,
                                  order_company: req.body.order.cust_company,
                                  order_date: moment(orderData.created)
                                    .tz('America/New_York')
                                    .format('MM/DD/YYYY hh:mm A z'),
                                  order_type:
                                    next_order_name.split('.')[1] === 'INV'
                                      ? 'Inventory'
                                      : next_order_name.split('.')[1] ===
                                        'DS' ||
                                        next_order_name.split('.')[1] === 'DSS'
                                        ? 'Direct Ship'
                                        : next_order_name.split('.')[1] === 'DEM'
                                          ? 'Demo'
                                          : 'Other',
                                  ship_name:
                                    req.body.order.ship_first_name +
                                    ' ' +
                                    req.body.order.ship_last_name,
                                  ship_address_1: req.body.order.ship_address_1,
                                  ship_address_2: req.body.order.ship_address_2,
                                  ship_city: req.body.order.ship_city,
                                  ship_state: req.body.order.ship_state,
                                  ship_zip: req.body.order.ship_zip,
                                  ship_phone: req.body.order.ship_phone,
                                  ship_email: req.body.order.ship_e_mail,
                                  ship_country: req.body.order.ship_country,
                                  dealer_company: req.body.order.cust_company,
                                  dealer_phone: req.body.order.cust_phone,
                                  items: goods,
                                };

                                emailManager(
                                  __dirname +
                                  '/../../templates/NewCustomerOrderConfirmation.html',
                                  replacements_customer,
                                  req.body.order.ship_e_mail,
                                  `Your Soniclean order(#: ${data.cust_ref}) has been confirmed`,
                                  null,
                                  null,
                                  () => {
                                    console.log('success-DS-Customer!');
                                  }
                                );
                                ////////////// DS-Order Dealer Email Order Confirm ///////////////

                                var replacements = {
                                  order_number: next_order_name,
                                  order_company: orderData.ship_company,
                                  order_date: moment(orderData.created)
                                    .tz('America/New_York')
                                    .format('MM/DD/YYYY hh:mm A z'),
                                  payment_type: 'Credit/Debit Card',
                                  order_type:
                                    next_order_name.split('.')[1] === 'INV'
                                      ? 'Inventory'
                                      : next_order_name.split('.')[1] ===
                                        'DS' ||
                                        next_order_name.split('.')[1] === 'DSS'
                                        ? 'Direct Ship'
                                        : next_order_name.split('.')[1] === 'DEM'
                                          ? 'Demo'
                                          : 'Other',
                                  ship_name:
                                    req.body.order.ship_first_name +
                                    ' ' +
                                    req.body.order.ship_last_name,
                                  ship_address_1: req.body.order.ship_address_1,
                                  ship_address_2: req.body.order.ship_address_2,
                                  ship_city: req.body.order.ship_city,
                                  ship_state: req.body.order.ship_state,
                                  ship_zip: req.body.order.ship_zip,
                                  ship_phone: req.body.order.ship_phone,
                                  ship_email: req.body.order.ship_e_mail,
                                  mohawk_account: req.body.mohawk_account,
                                  payment_status: 'Paid',
                                  subtotal: subTotal,
                                  items: goods,
                                  total: total,
                                  discount: discount,
                                };

                                let targetDealerEmails = req.body.selectedUsers.map(
                                  item => {
                                    return item['value'];
                                  }
                                );

                                targetDealerEmails.unshift(
                                  req.body.order.cust_e_mail
                                );

                                emailManager(
                                  __dirname +
                                  '/../../templates/NewDealerOrderConfirmation.html',
                                  replacements,
                                  targetDealerEmails.toString(),
                                  `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
                                  null,
                                  null,
                                  () => {
                                    console.log('success-DS-Dealer!');
                                  }
                                );
                              } else {
                                ////////////// INV, DEMO, DSS-Order Dealer Email Order Confirm ///////////////
                                var replacements = {
                                  order_number: next_order_name,
                                  order_company: orderData.ship_company,
                                  order_date: moment(orderData.created)
                                    .tz('America/New_York')
                                    .format('MM/DD/YYYY hh:mm A z'),
                                  payment_type: 'Credit/Debit Card',
                                  order_type:
                                    next_order_name.split('.')[1] === 'INV'
                                      ? 'Inventory'
                                      : next_order_name.split('.')[1] ===
                                        'DS' ||
                                        next_order_name.split('.')[1] === 'DSS'
                                        ? 'Direct Ship'
                                        : next_order_name.split('.')[1] === 'DEM'
                                          ? 'Demo'
                                          : 'Other',
                                  ship_name:
                                    req.body.order.ship_first_name +
                                    ' ' +
                                    req.body.order.ship_last_name,
                                  ship_address_1: req.body.order.ship_address_1,
                                  ship_address_2: req.body.order.ship_address_2,
                                  ship_city: req.body.order.ship_city,
                                  ship_state: req.body.order.ship_state,
                                  ship_zip: req.body.order.ship_zip,
                                  ship_phone: req.body.order.ship_phone,
                                  ship_email: req.body.order.ship_e_mail,
                                  mohawk_account: req.body.mohawk_account,
                                  payment_status: 'Paid',
                                  subtotal: subTotal,
                                  items: goods,
                                  total: total,
                                  discount: discount,
                                };

                                let targetDealerEmails = req.body.selectedUsers.map(
                                  item => {
                                    return item['value'];
                                  }
                                );

                                targetDealerEmails.unshift(
                                  req.body.order.cust_e_mail
                                );

                                emailManager(
                                  __dirname +
                                  '/../../templates/NewDealerOrderConfirmation.html',
                                  replacements,
                                  targetDealerEmails.toString(),
                                  `Your Soniclean order(#: ${next_order_name}) has been confirmed`,
                                  null,
                                  null,
                                  () => {
                                    console.log('success-IVN-Dealer!');
                                  }
                                );
                              }
                            });
                          } else {
                            res.status(400).json(data.message);
                            const order = new Orders({
                              payment_type: 'stripe',
                              mohawk_account: req.body.mohawk_account,
                              success_code: data.success_code,
                              cust_ref: data.cust_ref,
                              order_number: data.order_number,
                              createdBy: req.params.id,
                              order_status: '',
                              discount: req.body.discount,
                              dealeremail: req.body.cust_e_mail,
                              ship_company: req.body.order.ship_company,
                              sub_total: req.body.amount,
                              ship_first_name: req.body.order.ship_first_name,
                              ship_last_name: req.body.order.ship_last_name,
                              ship_address_1: req.body.order.ship_address_1,
                              ship_address_2: req.body.order.ship_address_2,
                              ship_city: req.body.order.ship_city,
                              ship_state: req.body.order.ship_state,
                              ship_zip: req.body.order.ship_zip,
                              ship_phone: req.body.order.ship_phone,
                              ship_e_mail: req.body.order.ship_e_mail,
                              trackingNumber: '',
                              items: req.body.order.items,
                            });

                            order.save().then(orderData => {
                              res.json(orderData);
                            });
                          }
                        } catch (e) {
                          return res
                            .status(400)
                            .json({ message: 'Failed to send order' });
                        }
                      })
                      .catch(err => {
                        return res
                          .status(400)
                          .json({ message: 'Failed to charge stripe' });
                      });
                  })
                  .catch(err => console.log(err));
              } catch (err) {
                return res
                  .status(400)
                  .json({ message: 'Failed to create stripe token' });
              }
            });
        });
      }
    }
  }
);

module.exports = router;
