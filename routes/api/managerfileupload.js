const express = require('express');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const mime = require('mime');
const multer = require('multer');

const Manager = require('../../models/Manager');

// const fileName = 'privacy-' + Date.now() + '.pdf';
// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/manager');
//   },
//   filename: (req, file, cb) => {
//     var filetype = 'pdf';
//     console.log('upr file', file);
//     if (file.mimetype === 'file/pdf') {
//       console.log('file->>>>', file);
//       filetype = 'pdf';
//     }
//     cb(null, fileName);
//   },
// });
// var upload = multer({ storage: storage });

// router.post(
//   '/fileupload',
//   passport.authenticate('jwt', { session: false }),
//   upload.single('file'),
//   function(req, res, next) {
//     if (!req.file) {
//       res.status(401).json({ error: 'Please provide a PDF' });
//       return;
//     }

//     const new_pdf = new Manager({
//       uploadfile: fileName,
//     });

//     new_pdf.save().then(pdf => {
//       if (pdf) {
//         res.json(pdf);
//       }
//     });
//   }
// );

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/manager');
  },
  filename: (req, file, cb) => {
    var filetype = 'pdf';
    if (file.mimetype === 'file/pdf') {
      filetype = 'pdf';
    }
    cb(null, 'privacy-' + Date.now() + '.' + filetype);
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
    const new_pdf = new Manager({
      uploadfile: req.file.filename,
    });

    new_pdf.save().then(pdf => {
      if (pdf) {
        res.json(pdf);
      }
    });
  }
);

module.exports = router;
