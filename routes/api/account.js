const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../../models/User');
const Orders = require('../../models/Orders');

const validateAccountInput = require('../../validation/account');

/* GET account info */
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // console.log('req.params->>>>', req.params);
    User.findById(req.params.id).then(user => {
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      // console.log('user found', user);
      let query = {};
      user.vacuumAccount
        ? (query['vacuum_account_number'] = user.vacuumAccount)
        : (query['mohawk_account_number'] = user.mohawkAccount);
      Orders.find(query).then(orders => {
        let data = {};
        data._id = user._id;
        data.firstName = user.firstName;
        data.lastName = user.lastName;
        data.email = user.email;
        data.phoneNumber = user.phoneNumber;
        data.workPhoneNumber = user.workPhoneNumber;
        data.extension = user.extension;
        data.userPhoto = user.userPhoto;
        data.roles = user.roles;
        data.storesCount = user.stores.length;
        data.ordersCount = orders.length;
        data.mohawkBrand = user.mohawkBrand;
        data.companyName = user.companyName;
        data.mohawkAccount = user.mohawkAccount;
        data.created = user.created;
        data.password = user.password;
        data._adminId = user._adminId;
        data.vacuumAccount = user.vacuumAccount;

        if (user.roles === 'manager') {
          res.json(data);
        }

        if (user.roles === 'dealer' || user.roles === 'vacuum-dealer') {
          data.mainstore = {};
          data.mainstore.name = user.stores[0].name;
          data.mainstore.phoneNumber = user.stores[0].phoneNumber;
          data.mainstore.address1 = user.stores[0].address1;
          data.mainstore.address2 = user.stores[0].address2;
          data.mainstore.city = user.stores[0].city;
          data.mainstore.us_state = user.stores[0].us_state;
          data.mainstore.zipcode = user.stores[0].zipcode;
          res.json(data);
        } else if (user.roles === 'employee') {
          User.findById(user._adminId).then(admin => {
            data.mainstore = {};
            data.mainstore.name = admin.stores[0].name;
            data.mainstore.phoneNumber = admin.stores[0].phoneNumber;
            data.mainstore.address1 = admin.stores[0].address1;
            data.mainstore.address2 = admin.stores[0].address2;
            data.mainstore.city = admin.stores[0].city;
            data.mainstore.us_state = admin.stores[0].us_state;
            data.mainstore.zipcode = admin.stores[0].zipcode;
            data.storesCount = admin.stores.length;
            data.mohawkBrand = admin.mohawkBrand;
            res.json(data);
          });
        }
      });
    });
  }
);

/* PUT account info */
router.put(
  '/update/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateAccountInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    User.findById(req.params.id).then(user => {
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.phoneNumber = req.body.phoneNumber;
      user.workPhoneNumber = req.body.workPhoneNumber;
      user.extension = req.body.extension;
      if (user.mohawkAccount) {
        user.mohawkAccount = req.body.mohawkAccount;
      }
      if (user.mohawkBrand) {
        user.mohawkBrand = req.body.mohawkBrand;
      }

      if (req.body.password !== user.password) {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then(user => {
                let data = {};
                data._id = user._id;
                data.firstName = user.firstName;
                data.lastName = user.lastName;
                data.email = user.email;
                data.phoneNumber = user.phoneNumber;
                data.workPhone = user.workPhone;
                data.extension = user.extension;
                data.workPhoneNumber = user.workPhoneNumber;
                data.userPhoto = user.userPhoto;
                data.roles = user.roles;
                data.storesCount = user.stores.length;
                data.mohawkBrand = user.mohawkBrand;
                data.companyName = user.companyName;
                data.mohawkAccount = user.mohawkAccount;
                data.created = user.created;
                data.password = user.password;

                if (user.roles === 'dealer') {
                  data.mainstore = {};
                  data.mainstore.name = user.stores[0].name;
                  data.mainstore.phoneNumber = user.stores[0].phoneNumber;
                  data.mainstore.address1 = user.stores[0].address1;
                  data.mainstore.address2 = user.stores[0].address2;
                  data.mainstore.city = user.stores[0].city;
                  data.mainstore.us_state = user.stores[0].us_state;
                  data.mainstore.zipcode = user.stores[0].zipcode;
                }

                res.json(data);
              })
              .catch(err => console.log(err));
          });
        });
      } else {
        user
          .save()
          .then(user => {
            let data = {};
            data._id = user._id;
            data.firstName = user.firstName;
            data.lastName = user.lastName;
            data.email = user.email;
            data.phoneNumber = user.phoneNumber;
            data.workPhone = user.workPhone;
            data.extension = user.extension;
            data.workPhoneNumber = user.workPhoneNumber;
            data.userPhoto = user.userPhoto;
            data.roles = user.roles;
            data.storesCount = user.stores.length;
            data.mohawkBrand = user.mohawkBrand;
            data.companyName = user.companyName;
            data.mohawkAccount = user.mohawkAccount;
            data.created = user.created;
            data.password = user.password;

            data.mainstore = {};
            data.mainstore.name = user.stores[0].name;
            data.mainstore.phoneNumber = user.stores[0].phoneNumber;
            data.mainstore.address1 = user.stores[0].address1;
            data.mainstore.address2 = user.stores[0].address2;
            data.mainstore.city = user.stores[0].city;
            data.mainstore.us_state = user.stores[0].us_state;
            data.mainstore.zipcode = user.stores[0].zipcode;
            res.json(data);
          })
          .catch(err => console.log(err));
      }
    });
  }
);

module.exports = router;
