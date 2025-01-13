const express = require('express');
const router = express.Router();
const keys = require('../../config/keys');
// const stripe = require('stripe')(keys.stripeTestPublicKey);
const stripe =
  process.env.NODE_ENV === 'production'
    ? require('stripe')(keys.stripeSecretKey)
    : require('stripe')(keys.stripeTestSecretKey);
const passport = require('passport');
const User = require('../../models/User');

/* POST a payment method */
router.post(
  '/add/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    User.findById(req.params.id)
      .then(async user => {
        if(!user.stripe_customer_id) {
          const customer = await stripe.customers.create({
            name: user.firstName + ' ' + user.lastName,
            email: user.email,
          });
          user.stripe_customer_id = customer.id;
          await user.save();
        }
        const attachPaymentMethod = await stripe.paymentMethods.attach(
          req.body.paymentMethodId,
          { customer: user.stripe_customer_id }
        );
        let data = [];
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripe_customer_id,
          type: 'card',
        });
        for (let method of paymentMethods.data) {
          let p = {};
          p._id = method.id;
          p.cardnumber = method.card.last4;
          p.cardtype = method.card.brand;
          p.expdate = `${method.card.exp_month}/${method.card.exp_year}`;
          data.push(p);
        }
        res.json(data);
      })
      .catch(err => console.log(err));
  }
);

/* GET stores list */
router.get(
  '/list/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.id)
      .then(async user => {
        let data = [];
        if (user.stripe_customer_id) {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripe_customer_id,
            type: 'card',
          });
          for (let method of paymentMethods.data) {
            let p = {};
            p._id = method.id;
            p.cardnumber = method.card.last4;
            p.cardtype = method.card.brand;
            p.expdate = `${method.card.exp_month}/${method.card.exp_year}`;
            data.push(p);
          }
        }
        res.json(data);
      })
      .catch(err => console.log(err));
  }
);

/* DELETE a store by ID */
router.delete(
  '/delete/:id/:dealer',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.dealer)
      .then(async user => {
        const detachPaymentMethod = await stripe.paymentMethods.detach(
          req.params.id
        );
        let data = [];
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripe_customer_id,
          type: 'card',
        });
        for (let method of paymentMethods.data) {
          let p = {};
          p._id = method.id;
          p.cardnumber = method.card.last4;
          p.cardtype = method.card.brand;
          p.expdate = `${method.card.exp_month}/${method.card.exp_year}`;
          data.push(p);
        }
        res.json(data);
      })
      .catch(err => console.log(err));
  }
);

// For inserting stripe customer_id in all users of user table
router.get(
  '/allUsers',
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.find({})
      .then(async users => {
        for (let user of users) {
          const customer = await stripe.customers.create({
            name: user.firstName + ' ' + user.lastName,
            email: user.email.toLowerCase(),
          });
          user.stripe_customer_id = customer.id;
          user.save().then(newUser => {
            console.log('newUser', newUser);
          });
        }
        res.json(users);
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
