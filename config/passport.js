const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          // console.log(
          //   'passport then',
          //   user,
          //   'payload->',
          //   jwt_payload,
          //   'jwt id->',
          //   jwt_payload.id
          // );
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log('passport error', err));
    })
  );
};
