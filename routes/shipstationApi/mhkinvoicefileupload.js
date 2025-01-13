const express = require('express');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');

const Orders = require('../../models/Orders');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/mohawk');
  },
  filename: (req, file, cb) => {
    var filetype = 'pdf';
    if (file.mimetype === 'file/pdf') {
      filetype = 'pdf';
    }
    cb(
      null,
      'Tungsten_MHK_Invoice_' + req.body.tungsten_invoice + '.' + filetype
    );
  },
});
var upload = multer({ storage: storage });

router.put(
  '/fileupload',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      res.status(401).json({ error: 'Please provide a PDF' });
      return;
    }
    fs.renameSync(
      req.file.path,
      req.file.path.replace('undefined', req.body.tungsten_invoice)
    );

    const tungsten_invoice = req.body.tungsten_invoice;
    const filename =
      'Tungsten_MHK_Invoice_' + req.body.tungsten_invoice + '.pdf';
    const orderId = req.body.orderId;

    try {
      let order = await Orders.findById(orderId);
      order.mohawk_order_invoice_number = tungsten_invoice;
      order.mohawk_order_invoice_file = filename;
      let updatedOrder = await order.save();
      res.json(updatedOrder);
    } catch (error) {
      res.status(401).json({ error: 'Cannot find order!' });
    }
  }
);

module.exports = router;
