const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const Dealerlist = require('../../models/Dealerlist');
const multer = require('multer');
const xlsxFile = require('read-excel-file/node');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/dealerlistfile');
  },
  filename: (req, file, cb) => {
    var filetype = 'xlsx';
    if (file.mimetype === 'file/xlsx') {
      filetype = 'xlsx';
    }
    cb(null, 'dealerlist-' + Date.now() + '.' + filetype);
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

    let defaultPassword = 'test123';

    const schema = {
      'Company Name': {
        prop: 'companyName',
        type: String,
      },
      Firstname: {
        prop: 'firstName',
        type: String,
      },
      Lastname: {
        prop: 'lastName',
        type: String,
      },
      Email: {
        prop: 'email',
        type: String,
      },
      Phone: {
        prop: 'phone',
        type: String,
      },
      'Mohawk Acct#': {
        prop: 'mohawkAccount',
        type: String,
      },
      'Address 1': {
        prop: 'address1',
        type: String,
      },
      'Address 2': {
        prop: 'address2',
        type: String,
      },

      City: {
        prop: 'city',
        type: String,
      },
      State: {
        prop: 'state',
        type: String,
      },
      'Zip Code': {
        prop: 'zipcode',
        type: String,
      },
      Registrationdate: {
        prop: 'created',
        type: String,
      },
      Website: {
        prop: 'website',
        type: String,
      },
    };

    const new_file = new Dealerlist({
      uploadfile: req.file.filename,
    });

    new_file.save().then(file => {
      if (file) {
        xlsxFile(`./public/dealerlistfile/${file.uploadfile}`, {
          schema,
        }).then(rows => {
          // console.log(rows);
          Promise.all(
            rows.rows.map(row => {
              const newUser = new User({
                email: row.email,
                firstName: row.firstName,
                lastName: row.lastName,
                phoneNumber: row.phone,
                companyName: row.companyName,
                websiteURL: row.website,
                mohawkAccount: row.mohawkAccount,
                mohawkBrand: 'Mohawk',
                roles: 'dealer',
                stores: {
                  name: row.companyName,
                  phoneNumber: row.phone,
                  address1: row.address1,
                  address2: row.address2,
                  city: row.city,
                  us_state: row.state,
                  zipcode: row.zipcode,
                  active: false,
                },
              });

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(defaultPassword, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser.save().then(user => {
                    console.log(user.email);
                  });
                });

                //   KarastanList.findOne()
                //     .sort('-created')
                //     .limit(1)
                //     .then(result => {
                //       xlsxFile(`./public/karastanexcel/${result.uploadfile}`, {
                //         schema,
                //       }).then(row => {
                //         console.log(row);
                //         // let bool_karastan = rows.rows.filter(
                //         //   item =>
                //         //     item.code.toString() ===
                //         //     req.body.mohawkAccount.toString()
                //         // );
                //         // if (bool_karastan.length > 0) {
                //         //   newUser.mohawkBrand = 'Karastan';
                //         // } else {
                //         //   newUser.mohawkBrand = 'Mohawk';
                //         // }
                //         newUser.password = hash;
                //         newUser
                //           .save()
                //           .then(user => {
                //             console.log(user.email);
                //             //   var replacements = {
                //             //     companyName: user.companyName,
                //             //   };
                //             //   emailManager(
                //             //     __dirname + '/../../templates/dealer_activation.html',
                //             //     replacements,
                //             //     'dev@sonicleanusa.com',
                //             //     () => {
                //             //       console.log('Success Dealer activation email sent!');
                //             //     }
                //             //   );
                //             //   var newToken = new Token({
                //             //     _userId: user._id,
                //             //     token: crypto.randomBytes(16).toString('hex'),
                //             //   });
                //             //   newToken.save().then(token => {
                //             //     res.json(token);
                //             //   });
                //           })
                //           .catch(err => console.log(err));
                //       });
                //     });
                // });
              });
            })
          ).then(response => {
            // console.log('asdf');
          });

          // Hash password before saving in database
        });
      }
    });
  }
);

module.exports = router;
