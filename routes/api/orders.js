const express = require('express');
const router = express.Router();
const keys = require('../../config/keys');
const passport = require('passport');
const axios = require('axios');
const moment = require('moment-timezone');
const User = require('../../models/User');
const Orders = require('../../models/Orders');
const MohawkToken = require('../../models/MohawkToken');

const emailManager = require('../../utils/emailmanager.js');
const ObjectId = require('mongodb').ObjectID;
const multer = require('multer');
const xlsxFile = require('read-excel-file/node');

const products = require('../../config/products');
const fsPromised = require('fs/promises');
const {
  createParserStrategy,
} = require('../../utils/excelParsers/createParserStrategy');
const { EXCEL_TYPES } = require('../../utils/excelParsers/ExcelParserStrategy');
const {
  ExcelStrategyExecutor,
} = require('../../utils/excelParsers/ExcelParserStrategy');
const { UploadFileOptions } = require('../../middlewares/fileUpload');
const { emptyFunction } = require('../../utils/emptyFunction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { FileValidationOptions } = require('../../validation/fileValidation');
const { uploadFileMiddleware } = require('../../middlewares/fileUpload');
const { orderXlsxSchema } = require('../../utils/consts');

router.put(
  '/fixingordersdealer',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let query = {};
    query['createdBy'] = ObjectId('5da3dfe94b21514e2f35b5fc');
    const page = 1,
      limit = 50;

    let response = await Orders.find(query)
      .limit(limit)
      .skip((page - 1) * limit);
    // console.log(response.length);
    Promise.all(
      response.map(async order => {
        let mohawk_account = await order.mohawk_account;
        let userRes = await User.findOne({ mohawkAccount: mohawk_account });
        if (userRes !== null) {
          let user_id = await userRes._id;
          order.createdBy = user_id;
          let saveOrder = await order.save();
          return user_id;
        } else {
          return '';
        }
      })
    ).then(data => {
      console.log(data);
    });
  }
);

/* GET Orders List method */
router.get(
  '/orderslist',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let query = {};
    if (req.query.id) {
      query['mohawk_account'] = req.query.id;
    }

    Orders.find(query)
      .sort({ created: 'desc' })
      .then(orders => {
        Promise.all(
          orders.map(async order => {
            if (order.cust_ref.split('.')[1] === 'MKT') {
              return order;
            } else {
              if (order.order_status === 'In Process') {
                let cust_ref = await order.cust_ref;
                try {
                  let l = await axios.get(
                    `https://api.cartrover.com/v1/cart/orders/status/${cust_ref}?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`
                  );
                  let ld = await l.data;

                  let k = await axios.get(
                    `https://api.cartrover.com/v1/cart/orders/${cust_ref}?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`
                  );
                  let kd = await k.data;

                  if (
                    ld.success_code &&
                    ld.response.order_status.toLowerCase() === 'shipped'
                  ) {
                    // console.log('making shipped');
                    //           // console.log(order.orderEmails, pd.response.shipments);
                    order.order_status = 'Shipped';
                    order.tracking_no = await ld.response.shipments
                      .map(ldt => ldt.tracking_no)
                      .toString();
                    order.shipped_date = await ld.response.shipments[0].date;
                    let goods = order.items.map(item => {
                      return {
                        name: item.name,
                        quantity: item.quantity,
                        imageurl: products[item.imageurl],
                        price: Number(item.price).toFixed(2),
                        sub_total: Number(item.sub_total).toFixed(2),
                      };
                    });

                    order.save().then(order => {
                      if (order.cust_ref.split('.')[1] === 'DS') {
                        ////////// DS order customer shipping eamil sending ////////////

                        var replacements_customer = {
                          order_number: order.cust_ref,
                          order_company: kd.cust_company,
                          order_date: moment(order.created)
                            .tz('America/New_York')
                            .format('MM/DD/YYYY hh:mm A z'),
                          shipped_date: moment(order.shipped_date).format(
                            'MM/DD/YYYY'
                          ),
                          payment_type: 'VISA',
                          order_type:
                            order.cust_ref.split('.')[1] === 'INV'
                              ? 'Inventory'
                              : order.cust_ref.split('.')[1] === 'DS' ||
                                order.cust_ref.split('.')[1] === 'DSS'
                              ? 'Direct Ship'
                              : order.cust_ref.split('.')[1] === 'DEM'
                              ? 'Demo'
                              : 'Other',
                          ship_name:
                            order.ship_first_name + ' ' + order.ship_last_name,
                          ship_address_1: order.ship_address_1,
                          ship_address_2: order.ship_address_2,
                          ship_city: order.ship_city,
                          ship_state: order.ship_state,
                          ship_zip: order.ship_zip,
                          ship_phone: order.ship_phone,
                          ship_email: order.ship_e_mail,
                          mohawk_account: order.mohawk_account,
                          payment_status: 'Paid',
                          subtotal: Number(order.sub_total).toFixed(2),
                          discount: Number(order.discount).toFixed(2),
                          items: goods,
                          trackingNumber: ld.response.shipments.map(ldt => {
                            return {
                              trackNumber: ldt.tracking_no,
                            };
                          }),
                          total: Number(
                            Number(order.sub_total) - Number(order.discount)
                          ).toFixed(2),
                        };
                        emailManager(
                          __dirname +
                            '/../../templates/NewCustomerShippingConfirmation.html',
                          replacements_customer,
                          order.orderEmails,
                          `Your Soniclean order(#: ${order.cust_ref}) has shipped`,
                          null,
                          null,
                          () => {
                            console.log('Shipping-customer-email-success!');
                          }
                        );
                      }
                      var replacements = {
                        order_number: order.cust_ref,
                        order_company: kd.cust_company,
                        order_date: moment(order.created)
                          .tz('America/New_York')
                          .format('MM/DD/YYYY hh:mm A z'),
                        shipped_date: moment(order.shipped_date).format(
                          'MM/DD/YYYY'
                        ),
                        payment_type: 'VISA',
                        order_type:
                          order.cust_ref.split('.')[1] === 'INV'
                            ? 'Inventory'
                            : order.cust_ref.split('.')[1] === 'DS'
                            ? 'Direct Ship'
                            : order.cust_ref.split('.')[1] === 'DSS'
                            ? 'Direct Ship Store'
                            : order.cust_ref.split('.')[1] === 'DEM'
                            ? 'Demo'
                            : 'Marketing',
                        ship_name:
                          order.ship_first_name + ' ' + order.ship_last_name,
                        ship_address_1: order.ship_address_1,
                        ship_address_2: order.ship_address_2,
                        ship_city: order.ship_city,
                        ship_state: order.ship_state,
                        ship_zip: order.ship_zip,
                        ship_phone: order.ship_phone,
                        ship_email: order.ship_e_mail,
                        mohawk_account: order.mohawk_account,
                        payment_status: 'Paid',
                        subtotal: Number(order.sub_total).toFixed(2),
                        discount: Number(order.discount).toFixed(2),
                        items: goods,
                        trackingNumber: ld.response.shipments.map(ldt => {
                          return {
                            trackNumber: ldt.tracking_no,
                          };
                        }),
                        total: Number(
                          Number(order.sub_total) - Number(order.discount)
                        ).toFixed(2),
                      };
                      emailManager(
                        __dirname +
                          '/../../templates/NewDealerShippingConfirmation.html',
                        replacements,
                        order.orderEmails,
                        `Your Soniclean order(#: ${order.cust_ref}) has shipped`,
                        null,
                        null,
                        () => {
                          console.log('Shipping-dealer-email-success!');
                        }
                      );
                    });
                  }
                } catch (error) {}
              }

              return order;
            }
          })
        ).then(response => {
          var data = {
            data: response.filter(function(el) {
              return el != null;
            }),
          };
          res.json(data);
        });
      });
  }
);

/* GET a Order by ID method */
router.get(
  '/order/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Orders.findOne({ _id: req.params.id })
      .then(async order => {
        if (order.cust_ref.split('.')[1] === 'MKT') {
          var data = {
            orderData: order,
            orderStatus: order.order_status,
            orderPayment: order.payment_type,
            orderMohawk: order.mohawk_invoice,
            discount: order.discount,
          };
          res.json(data);
        } else {
          let tracking_no;
          try {
            let cust_ref = await order.cust_ref;
            let l = await axios.get(
              `https://api.cartrover.com/v1/cart/orders/status/${cust_ref}?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`
            );
            let ld = await l.data;
            tracking_no = ld.response.shipments.map(ldt => ldt.tracking_no);
          } catch (error) {
            tracking_no = [];
          }

          let data = {
            orderData: order,
            orderStatus: order.order_status,
            orderPayment: order.payment_type,
            orderMohawk: order.mohawk_invoice,
            orderMohawkInvoiceDate: order.mohawk_invoice_date,
            discount: order.discount,
            trackingNumbers: tracking_no,
          };

          res.json(data);
        }
      })
      .catch(err => {
        return res.status(404).json({ message: 'Cannot find the Order.' });
      });
  }
);
router.patch('/order-release/:id',
    passport.authenticate('jwt', { session: false }) ,
    async (req, res) => {
  try {
          let order = await Orders.findById(req.params.id);
          if(order == null)
          {
            res.status(400).json({ message: ' cannot find the order' });
          }
          order['mohawk_order_status'] = 'released';

          let updatedOrder = await order.save();
          res.json(updatedOrder);

     } catch (error) {
    res.status(400).json({ message: 'Oops! cannot release  the order' });
  }
}
)
router.delete(
  '/order/:id',
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

router.put(
  '/order/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let order = await Orders.findById(req.params.id);
      order['mohawk_account'] = req.body['mohawk_account'];
      order['orderEmails'] = req.body['orderEmails'];
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

      let new_order = await order.save();
      if (new_order === null) {
        res.status(400).json({ message: 'Oops! cannot updated the order' });
      } else {
        let data = {
          orderData: order,
          orderStatus: order.order_status,
          orderPayment: order.payment_type,
          orderMohawk: order.mohawk_invoice,
          discount: order.discount,
        };
        res.json(data);
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

router.post(
  '/recreate',
  passport.authenticate('jwt', { session: false }),
  ...uploadFileMiddleware(
    new UploadFileOptions(
      'file',
      './public',
      new FileValidationOptions('file', ['xlsx'], true)
    )
  ),
  async (req, res) => {
    const excelStrategyExecutor = ExcelStrategyExecutor.create();
    const strategy = createParserStrategy(
      EXCEL_TYPES.ORDERS,
      res,
      req.file.path
    );
    const parsedOrders = await excelStrategyExecutor.set(strategy).execute();

    if (!parsedOrders) return;

    await Orders.collection.drop().catch(emptyFunction);
    await Orders.insertMany(parsedOrders);

    return ResponseBuilder.createResponseBuilder(res)
      .withStatus(200)
      .withMessage('Replaced all records')
      .send();
  }
);

router.post(
  '/update-or-create',
  passport.authenticate('jwt', { session: false }),
  ...uploadFileMiddleware(
    new UploadFileOptions(
      'file',
      './public',
      new FileValidationOptions('file', ['xlsx'], true)
    )
  ),
  async (req, res) => {
    const excelStrategyExecutor = ExcelStrategyExecutor.create();
    const strategy = createParserStrategy(
      EXCEL_TYPES.ORDERS,
      res,
      req.file.path
    );
    const parsedOrders = await excelStrategyExecutor.set(strategy).execute();

    if (!parsedOrders) return;

    await Promise.all(
      parsedOrders.map(async order => {
        return Orders.updateOne(
          {
            order_number: {
              $eq: order.order_number,
            },
          },
          order,
          {
            upsert: true,
          }
        );
      })
    );

    return ResponseBuilder.createResponseBuilder(res)
      .withStatusCode(200)
      .withMessage('Ok')
      .send();
  }
);

router.put(
  '/:id/fileupload',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  function(req, res, next) {
    if (!req.file) {
      res.status(401).json({ error: 'Please provide a PDF' });
      return;
    }

    xlsxFile(`${req.file.path}`, {
      schema: orderXlsxSchema,
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

          // console.log(row);

          order.payment_type =
            row.payment_type === 'Credit/Debit' ? 'stripe' : row.payment_type;
          order.mohawk_account = row.mohawk_account;
          order.success_code = true;
          order.cust_ref = row.order_number;
          order.order_number = row.order_number;
          order.created = row.created;
          order.createdBy = order.createdBy;
          order.orderEmails = row.orderEmails;
          order.dealeremail = row.orderEmails;
          order.order_status = row.order_status;
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
          order.ship_e_mail = row.ship_e_mail;
          order.trackingNumber = row.tracking_no;
          order.items = item;
          order.discount = row.discount;

          return order;
        });

        unique = temp
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
        // Promise.all(
        //   orderlist.map(async od => {
        //     return await od.save();
        //   })
        // ).then(response => {
        //   console.log(response);
        //   res.json(response[0]);
        // });
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
      order.mohawk_invoice_date = moment(req.body.invoiceDate)
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
  (req, res) => {
    Orders.findById(req.params.id).then(order => {
      order.mkt_trackingnumber = req.body.mkt_trackingnumber;
      order.order_status = 'Shipped';
      order.shipped_date = new Date();
      // console.log(order.orderEmails);
      order
        .save()
        .then(order => {
          res.json(order);

          let goods = order.items.map(item => {
            return {
              name: item.name,
              quantity: item.quantity,
              imageurl: products[item.imageurl],
              price: Number(item.price).toFixed(2),
              sub_total: Number(item.sub_total).toFixed(2),
            };
          });

          var replacements_mkt = {
            order_number: order.cust_ref,
            order_company: order.ship_company,
            payment_type: 'VISA',
            order_type: 'Marketing',
            order_date: moment(order.created)
              .tz('America/New_York')
              .format('MM/DD/YYYY hh:mm A z'),
            shipped_date: moment(order.shipped_date).format('MM/DD/YYYY'),
            ship_name: order.ship_first_name + ' ' + order.ship_last_name,
            ship_address_1: order.ship_address_1,
            ship_address_2: order.ship_address_2,
            ship_city: order.ship_city,
            ship_state: order.ship_state,
            ship_zip: order.ship_zip,
            ship_country: 'USA',
            ship_email: order.orderEmails,
            ship_phone: order.ship_phone,
            mohawk_account: order.mohawk_account,
            payment_status: 'Paid',
            items: goods,
            subtotal: Number(order.sub_total).toFixed(2),
            discount: Number(order.discount).toFixed(2),
            trackingNumber: req.body.mkt_trackingnumber.split(',').map(item => {
              return { trackNumber: item };
            }),
            total: Number(
              Number(order.sub_total) - Number(order.discount)
            ).toFixed(2),
          };

          emailManager(
            __dirname + '/../../templates/NewDealerShippingConfirmation.html',
            replacements_mkt,
            order.orderEmails,
            `Your Soniclean order(#: ${order.cust_ref}) has shipped`,
            null,
            null,
            () => {
              console.log('success-MKT-Order-Shipped-Dealer!');
            }
          );
        })
        .catch(err => console.log(err));
    });
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
    orderInfo.mohawk_status = req.body.status;
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
        updatedOrderInfo.orderEmails,
        `Your Soniclean order(#: ${updatedOrderInfo.order_number}) has been Rejected`,
        null,
        null,
        () => {
          console.log('success-dealer-mohawk-order-rejected!');
        }
      );
    });
  } catch (error) {
    res.status(400).json({ message: 'Oops! cannot find the order' });
  }
});

router.put('/reinstate/:id', async (req, res) => {
  // console.log(req.params.token);
  try {
    let orderInfo = await Orders.findById(req.params.id);
    orderInfo.mohawk_status = 'pending';
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
        __dirname + '/../../templates/NewDealerMohawkPending.html',
        replacements,
        updatedOrderInfo.orderEmails,
        `Your Soniclean order(#: ${updatedOrderInfo.order_number}) has been confirmed`,
        null,
        null,
        () => {
          console.log('success-dealer-mohawk-pending!');
        }
      );

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

router.get('/livedealers', async (req, res) => {
  const FIRSTPDT = 'DEMO-SFC7000';
  const SECONDPDT = 'DEMO-KSC7500';
  try {
    let orderinfo = await Orders.find({
      $or: [{ 'items.item': FIRSTPDT }, { 'items.item': SECONDPDT }],
    }).populate('createdBy');
    res.json(orderinfo);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
