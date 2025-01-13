const express = require('express');
const fs = require('fs');
const router = express.Router();
const Orders = require('../../models/Orders');
const multer = require('multer');
const emailManager = require('../../utils/emailmanager.js');
const products = require('../../config/products');
const moment = require('moment-timezone');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/POinfofiles');
  },
  filename: (req, file, cb) => {
    var filetype = 'pdf';
    if (file.mimetype === 'file/pdf') {
      filetype = 'pdf';
    }
    cb(null, 'Mohawk_PO_' + req.body.po_number + '.' + filetype);
  },
});
var upload = multer({ storage: storage });

router.post('/share/:token', upload.single('file'), function (req, res, next) {
  if (!req.file) {
    res.status(401).json({ error: 'Please provide a PDF' });
    return;
  }

  MohawkToken.findOne({
    mohawkToken: req.params.token,
  })
    .then(tokenInfo => {
      Orders.findById(tokenInfo._orderId).then(orderInfo => {
        fs.renameSync(
          req.file.path,
          req.file.path.replace('undefined', req.body.po_number)
        );

        orderInfo.mohawk_order_status = req.body.status;
        orderInfo.mohawk_po_manager = req.body.po_manager;
        orderInfo.mohawk_po_number = req.body.po_number;
        orderInfo.mohawk_po_file = 'Mohawk_PO_' + req.body.po_number + '.pdf';
        orderInfo
          .save()
          .then(updatedOrderInfo => {
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
              payment_type: 'Mohawk',
              payment_status: 'Approved',
              mohawk_account: updatedOrderInfo.mohawk_account_number,
              subtotal: updatedOrderInfo.sub_total,
              items: goods,
              total: Number(
                parseFloat(updatedOrderInfo.sub_total) -
                parseFloat(updatedOrderInfo.discount)
              ).toFixed(2),
              discount: updatedOrderInfo.discount,
            };

            emailManager(
              __dirname + '/../../templates/NewSonicleanMohawkApproved.html',
              replacements,
              process.env.NODE_ENV === 'production'
                ? require('../../config/keys').productionEmailAlias
                : require('../../config/keys').developmentEmail,
              `${updatedOrderInfo.order_number} ORDER - NEED TO RELEASE`,
              null,
              null,
              () => {
                console.log('success-Soniclean-mohawk-order-approved!');
              }
            );

            emailManager(
              __dirname + '/../../templates/NewDealerMohawkApproved.html',
              replacements,
              updatedOrderInfo.dealer_email.toString(),
              `Your Soniclean order(#: ${updatedOrderInfo.order_number}) has been Approved`,
              null,
              null,
              () => {
                console.log('success-dealer-mohawk-order-approved!');
              }
            );
          })
          .catch(err => res.status(401).json({ error: err }));
      });
    })
    .catch(error => res.status(401).json({ error: error }));
});

module.exports = router;
