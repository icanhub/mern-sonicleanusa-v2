const express = require('express');
const router = express.Router();
const keys = require('../../config/keys');
const passport = require('passport');

const User = require('../../models/User');
const Store = require('../../models/Store');

const validateStoreLocationInput = require('../../validation/store');

// router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
//     res.send(req.user)
// })

/* POST a store location */
router.post(
  '/add/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateStoreLocationInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const new_store = new Store({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      us_state: req.body.us_state,
      zipcode: req.body.zipcode,
    });

    const name = req.body.name;

    function breakForOfLoop(arrayToBreak) {
      for (let elem of arrayToBreak) {
        console.log(elem); //result: "My","name"
        if (elem.name === name) {
          return true;
        }
      }
      return true;
    }

    User.findById(req.params.id).then(user => {
      if (user.stores.length === 0) {
        user.stores.push(new_store);
      } else {
        if (!breakForOfLoop(user.stores)) {
          return res.status(404).json({ message: 'Store is exist!' });
        } else {
          user.stores.push(new_store);
        }
      }

      user
        .save()
        .then(user => {
          res.json(user.stores);
        })
        .catch(err => console.log(err));
    });
  }
);

/* PUT payment list */

router.put(
  '/update/:id/:dealer',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateStoreLocationInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const new_store = new Store({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      us_state: req.body.us_state,
      zipcode: req.body.zipcode,
    });

    User.findById(req.params.dealer).then(user => {
      const store = user.stores.id(req.params.id);
      if (store) {
        store.set(new_store);
      } else {
        return res.status(404).json({ message: 'cannot find the store' });
      }

      user
        .save()
        .then(user => {
          res.json(user.stores);
        })
        .catch(err => console.log(err));
    });
  }
);

/* GET payment list */
router.get(
  '/list/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.id).then(user => {
      res.json(user.stores);
    });
  }
);

/* GET a payment by ID */
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.user._id).then(user => {
      if (user.stores.id(req.params.id)) {
        res.json(user.stores.id(req.params.id));
      } else {
        return res.status(404).json({ message: 'cannot find the store' });
      }
    });
  }
);

/* DETE a payment by ID */
router.delete(
  '/delete/:id/:dealer',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.dealer).then(user => {
      if (user.stores.id(req.params.id)) {
        user.stores.id(req.params.id).remove();
      } else {
        return res.status(404).json({ message: 'cannot find the store' });
      }

      user
        .save()
        .then(user => {
          res.json(user.stores);
        })
        .catch(err => console.log(err));
    });
  }
);

module.exports = router;
