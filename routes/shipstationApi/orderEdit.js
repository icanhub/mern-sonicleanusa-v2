const express = require('express');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');

const Orders = require('../../models/Orders');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      if(file.fieldname==='mohawk_po_file') {
        cb(null, './public/POinfofiles');
      } else {
        cb(null, './public/mohawk');
      }
  },
  filename: (req, file, cb) => {
    var filetype = 'pdf';
    if (file.mimetype === 'file/pdf') {
      filetype = 'pdf';
    }
    if(file.fieldname==='mohawk_po_file') { 
        cb(null, 'Mohawk_PO_' + req.body.mohawk_po_number + '.' + filetype);
    } else {
        cb(null, 'Tungsten_MHK_Invoice_' + req.body.mohawk_order_invoice_number + '.' + filetype);
        
    }
  },
});
var upload = multer({ storage: storage });

router.put('/:orderId', passport.authenticate('jwt', { session: false }), 
    upload.fields([{name: 'mohawk_po_file'}, {name: 'mohawk_order_invoice_file'}]), 
    async (req, res) => {

      try {
        let order = await Orders.findById(req.params.orderId);
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
        order['items'] = JSON.parse(req.body['items']);
        order['tracking_number'] = req.body['order_status']==='shipped' ? req.body['tracking_number']: undefined;
        order['shipped_date'] = req.body['order_status']==='shipped' ? req.body['shipped_date']: undefined;
        if(req.body['payment_type']==='mohawk') {
          if(req.body['mohawk_po_number']==='undefined' && req.body['mohawk_po_manager']==='undefined') {
            order['mohawk_order_status']='pending';
            order['mohawk_po_number'] = undefined;
            order['mohawk_po_manager'] = undefined;
            order['mohawk_po_file'] = undefined;
          } else {
            order['mohawk_order_status']='released';
            order['mohawk_po_number'] = req.body['mohawk_po_number'];
            order['mohawk_po_manager'] = req.body['mohawk_po_manager'];
            order['mohawk_po_file'] = 'Mohawk_PO_' + req.body.mohawk_po_number + '.pdf';
          }

          if(req.body['mohawk_order_invoice_number'] === 'undefined') {
            order['mohawk_order_invoice_number'] = undefined;
            order['mohawk_order_invoice_file'] = undefined;
          } else {
            order['mohawk_order_invoice_number'] = req.body['mohawk_order_invoice_number'];
            order['mohawk_order_invoice_file'] = 'Tungsten_MHK_Invoice_' + req.body.mohawk_order_invoice_number + '.pdf';
          }
          order['mohawk_order_paid_date'] = req.body['mohawk_payment_status']==='unpaid' ? undefined: req.body['mohawk_order_paid_date'];
        } else {
          order['mohawk_order_status'] = undefined;
          order['mohawk_po_number'] = undefined;
          order['mohawk_po_manager'] = undefined;
          order['mohawk_order_invoice_number'] = undefined;
          order['mohawk_order_paid_date'] = undefined;
          order['mohawk_po_file'] = undefined;
          order['mohawk_order_invoice_file'] = undefined;
        }

        let upated_order = await order.save();
        // console.log(upated_order)
        if (upated_order === null) {
          res.status(400).json({ message: 'Oops! cannot updated the order' });
        } else {
          res.json(upated_order);
        }
      } catch (error) {
        res.status(400).json({ message: '1111! cannot find the order' });
      }
  }
);

module.exports = router;
