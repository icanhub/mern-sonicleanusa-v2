const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const karastanlist = require('../../models/KarastanList');
const multer = require('multer');
const xlsxFile = require('read-excel-file/node');
const { karastanExcelSchema } = require('../../utils/consts');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/karastanexcel');
  },
  filename: (req, file, cb) => {
    var filetype = 'xlsx';
    if (file.mimetype === 'file/xlsx') {
      filetype = 'xlsx';
    }
    cb(null, 'mohawkexcel-' + Date.now() + '.' + filetype);
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

    const new_file = new karastanlist({
      uploadfile: req.file.filename,
    });

    new_file.save().then(file => {
      if (file) {
        xlsxFile(`./public/karastanexcel/${file.uploadfile}`, { schema: karastanExcelSchema }).then(
          rows => {
            User.find({}, function(err, users) {
              Promise.all(
                users.map(async user => {
                  const bool_karastan = rows.rows.filter(
                    item =>
                      item.code.toString() === user.mohawkAccount.toString()
                  );
                  if (bool_karastan.length > 0) {
                    user.mohawkBrand = 'Karastan';
                  } else {
                    user.mohawkBrand = 'Mohawk';
                  }
                  let updateduser = await user.save();
                  return updateduser;
                })
              ).then(response => {
                if (rows) res.json(rows.rows);
              });
            });
          }
        );
      }
    });
  }
);

module.exports = router;
