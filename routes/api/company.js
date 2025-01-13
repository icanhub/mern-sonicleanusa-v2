const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');

const validateCompanyInput = require('../../validation/company');

/* GET Company info */
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.id).then(user => {
      let data = {};
      data._id = user._id;
      (data.companyName = user.companyName),
        (data.phoneNumber = user.phoneNumber),
        (data.companyBio = user.companyBio),
        (data.companyLogo = user.companyLogo);
      res.json(data);
    });
  }
);

/* PUT Company info */
router.put(
  '/update/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCompanyInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    User.findById(req.params.id).then(user => {
      user.companyName = req.body.companyName;
      user.phoneNumber = req.body.phoneNumber;
      user.companyBio = req.body.companyBio;
      user
        .save()
        .then(user => {
          let data = {};
          data._id = user._id;
          data.companyName = user.companyName;
          data.phoneNumber = user.phoneNumber;
          data.companyBio = user.companyBio;
          res.json(data);
        })
        .catch(err => console.log(err));
    });
  }
);

module.exports = router;
