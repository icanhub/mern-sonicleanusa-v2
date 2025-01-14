const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const crypto = require('crypto');
const Karastan = require('../../models/Karastan');
const emailManager = require('../../utils/emailmanager.js');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateConfirmationInput = require('../../validation/confirmation');
const stripe =
  process.env.NODE_ENV === 'production'
    ? require('stripe')(keys.stripeSecretKey)
    : require('stripe')(keys.stripeTestSecretKey);
// Load User model
const User = require('../../models/User');
const Manager = require('../../models/Manager');
const Token = require('../../models/Token');
const appURL =
  process.env.NODE_ENV === 'production'
    ? 'https://dealers.sonicleanusa.com'
    : 'http://dev.dealers.sonicleanusa.com';

// @route POST api/users/register
// @desc Register user
// @access Public


// xlsxFile('./public/karastanexcel/data.xlsx', { schema }).then(rows => {
//   let bol_karastan = rows.rows.filter(
//     item => item.code.toString() === '333333'
//   );
//   console.log(bol_karastan.length);
// });

router.post('/register', async (req, res) => {
  // Form validation
  const defaultPassword = 'test123';

  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({
    $or: [{ email: req.body.email }, { mohawkAccount: req.body.mohawkAccount }],
  }).exec();
  
  if (user) {
    return res
      .status(400)
      .json({ message: 'Email already exists or Mohawk Account exists' });
  } else {
    const customer = await stripe.customers.create({
      name: req.body.firstName + ' ' + req.body.lastName,
      email: req.body.email.toLowerCase(),
    });
    const newUser = new User({
      email: req.body.email.toLowerCase(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      companyName: req.body.companyName,
      websiteURL: req.body.websiteURL,
      mohawkAccount: req.body.mohawkAccount,
      mohawkBrand: req.body.mohawkBrand,
      stripe_customer_id: customer.id,
      roles: 'dealer',
      stores: {
        name: req.body.companyName,
        phoneNumber: req.body.phoneNumber,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        us_state: req.body.us_state,
        zipcode: req.body.zipcode,
        active: false,
      },
    });
    
    // Hash password before saving in database
    bcrypt.genSalt(11, (err, salt) => {
      bcrypt.hash(defaultPassword, salt, async (err, hash) => {
        if (err) throw err;
        const karastan = await Karastan.findOne({
          code: req.body.mohawkAccount,
        }).exec();
        
        if (karastan) {
          newUser.mohawkBrand = 'Karastan';
        } else {
          newUser.mohawkBrand = 'Mohawk';
        }
        newUser.password = hash;
        newUser
          .save()
          .then(user => {
            const replacements = {
              companyName: user.companyName,
              appURL: appURL,
            };
      
            const newToken = new Token({
              _userId: user._id,
              token: crypto.randomBytes(16).toString('hex'),
            });
      
            newToken.save().then(token => {
              // console.log('step7');
              res.json(token);
            });
            emailManager(
              __dirname + '/../../templates/dealer_activation_new.html',
              replacements,
              process.env.NODE_ENV === 'production'
                ? require('../../config/keys').productionEmailAlias
                : require('../../config/keys').developmentEmail,
              `NEW Dealer! –- PLEASE ACTIVATE`,
              null,
              null,
              () => {
                console.log(
                  'Success Dealer activation request email sent!'
                );
              }
            );
          })
          .catch(err => console.log(err));
      });
    });
  }
});

// To register a vacuum dealer-
router.post('/vacuumregister', async (req, res) => {
  // Form validation

  let defaultPassword = 'test123';
  const { errors, isValid } = validateRegisterInput(req.body, true);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({
    $and: [{ email: req.body.email }],
  }).then(async user => {
    if (user) {
      return res.status(400).json({ message: 'Email already exists!' });
    } else {
      const customer = await stripe.customers.create({
        name: req.body.firstName + ' ' + req.body.lastName,
        email: req.body.email.toLowerCase(),
      });
      const vacuumaccount = `VD${Math.floor(Math.random() * 90000) + 10000}`;

      const newUser = new User({
        email: req.body.email.toLowerCase(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        companyName: req.body.companyName,
        websiteURL: req.body.websiteURL,
        vacuumAccount: vacuumaccount,
        isVerified: true,
        stripe_customer_id: customer.id,
        roles: 'vacuum-dealer',
        mohawkBrand: '',
        stores: {
          name: req.body.companyName,
          phoneNumber: req.body.phoneNumber,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          us_state: req.body.us_state,
          zipcode: req.body.zipcode,
          active: false,
        },
      });

      // Hash password before saving in database
      bcrypt.genSalt(11, (err, salt) => {
        bcrypt.hash(defaultPassword, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then(async saveduser => {
            var newToken = new Token({
              _userId: saveduser._id,
              token: crypto.randomBytes(16).toString('hex'),
            });

            await newToken
              .save()
              .then(newtoken => {
                Token.findOne({ _userId: saveduser._id })
                  .then(token => {
                    if (!token) {
                      return res
                        .status(404)
                        .json({ message: 'Token not found' });
                    }
                    var replacements = {
                      firstname: saveduser.firstName,
                      token: token.token,
                      companyName: saveduser.companyName,
                      appURL: appURL,
                    };

                    emailManager(
                      __dirname + '/../../templates/NewDealerActivation.html',
                      replacements,
                      saveduser.email,
                      `Your Soniclean Retailer Account has Been Activated`,
                      'Vacuum-program-detail.pdf',
                      __dirname +
                        '/../../public/manager/Privacy-Vacuum-20210915.pdf',
                      () => {
                        console.log('Vacuum dealer mail sent');
                      }
                    );
                  })
                  .catch(err => console.log(err));
                res.json(newtoken);
              })
              .catch(err => console.log(err));
          });
        });
      });
    }
  });
});

// To add a new-dealer through email invite from admin
router.post('/add-new-dealer', (req, res) => {
  const { firstName, lastName, email } = req.body;
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (user) {
      return res.status(400).send({ message: 'Email already exists!' });
    } else {
      const uniqueId = uuidv4();
      const newUser = new User({
        email: email.toLowerCase(),
        firstName,
        lastName,
        roles: 'vacuum-dealer',
        mohawkBrand: '',
        vacuumtoken: uniqueId,
      });

      newUser
        .save()
        .then(user => {
          // sending mail to invite dealer
          var replacements = {
            firstName,
            uniqueId,
            appURL: appURL,
          };
          emailManager(
            __dirname + '/../../templates/vacuum_dealer_invite.html',
            replacements,
            user.email,
            `New Vacuum Dealer Registration`,
            null,
            () => {
              console.log('Success Dealer registration invitation email sent!');
            }
          );
          return res.status(201).send({ message: 'Invite email sent!' });
        })
        .catch(error => {
          console.log(error);
        });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post('/login', (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists

    if (!user) {
      return res.status(401).json({ message: 'Email not found' });
    }

    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: 'Your account has not been verified.' });

    // bcrypt.compare(password, user.password).then(isMatch => {
    //   if (isMatch) {
    //     // User matched
    //     // Create JWT Payload
    //     console.log('this is three')
    //     let query = { roles: 'dealer', isVerified: false };

    //     User.find(query).then(response => {
    //       const payload = {
    //         id: user.id,
    //         email: user.email,
    //         roles: user.roles,
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         companyName: user.companyName,
    //         mohawkAccount: user.mohawkAccount,
    //         userPhoto: user.userPhoto,
    //         _adminId: user._adminId,
    //         newDealerCount:
    //           user.roles === 'official' || user.roles === 'manager'
    //             ? response.length
    //             : null,
    //         newPriceAccepted: user.newPriceAccepted,
    //         vacuumAccount: user.vacuumAccount,
    //       };

    // //       // Sign token
    //       jwt.sign(
    //         payload,
    //         keys.secretOrKey,
    //         {
    //           expiresIn: '1h',
    //         },
    //         (err, token) => {
    //           res.json({
    //             success: true,
    //             token: 'Bearer ' + token,
    //           });
    //         }
    //       );
    //     });
    //   } else {
    //     return res.status(401).json({ message: 'Password incorrect' });
    //   }
    // });
        let query = { roles: 'dealer', isVerified: false };

        User.find(query).then(res=>{
          console.log(res);
        })
        User.find(query).then(response => {
          const payload = {
            id: user.id,
            email: user.email,
            roles: user.roles,
            firstName: user.firstName,
            lastName: user.lastName,
            companyName: user.companyName,
            mohawkAccount: user.mohawkAccount,
            userPhoto: user.userPhoto,
            _adminId: user._adminId,
            newDealerCount:
              user.roles === 'official' || user.roles === 'manager'
                ? response.length
                : null,
            newPriceAccepted: user.newPriceAccepted,
            vacuumAccount: user.vacuumAccount,
          };

    //       // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: '1h',
            },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token,
              });
            }
          );
        });
  });
});

router.put(
  '/updatePrice/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.id).then(user => {
      user.newPriceAccepted = 1;
      user
        .save()
        .then(user => {
          const payload = {
            id: user.id,
            email: user.email,
            roles: user.roles,
            firstName: user.firstName,
            lastName: user.lastName,
            companyName: user.companyName,
            mohawkAccount: user.mohawkAccount,
            userPhoto: user.userPhoto,
            _adminId: user._adminId,
            newDealerCount:
              user.roles === 'official' || user.roles === 'manager'
                ? res.length
                : null,
            newPriceAccepted: user.newPriceAccepted,
            vacuumAccount: user.vacuumAccount,
          };

          // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: '1h',
            },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token,
              });
            }
          );
        })
        .catch(err => console.log(err));
    });
  }
);

router.post('/confirmation', (req, res) => {
  const { errors, isValid } = validateConfirmationInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Token.findOne({ token: req.body.token }, function(err, token) {
    if (!token)
      return res.status(400).json({
        message:
          'We were unable to find a valid token. Your token my have expired.',
      });

    // If we found a token, find a matching user
    User.findOne({ _id: token._userId }, function(err, user) {
      if (!user)
        return res
          .status(400)
          .json({ message: 'We were unable to find a user for this token.' });
      // if (user.isVerified)
      //   return res
      //     .status(400)
      //     .json({ message: 'This user has already been verified.' });

      // Verify, reset password and save the user
      user.isVerified = true;
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user.save(function(err) {
            if (err) {
              return res.status(500).json({ message: err.message });
            }
            res.status(200).json({
              success: true,
              message: 'The account has been verified. Please log in.',
            });
          });
        });
      });
    });
  });
});

// router.post('/resend', (req, res) => {
//   User.findOne({ email: req.body.email }, function(err, user) {
//     if (!user)
//       return res
//         .status(400)
//         .send({ msg: 'We were unable to find a user with that email.' });
//     if (user.isVerified)
//       return res.status(400).send({
//         msg: 'This account has already been verified. Please log in.',
//       });

//     // Create a verification token, save it, and send email
//     var token = new Token({
//       _userId: user._id,
//       token: crypto.randomBytes(16).toString('hex'),
//     });

//     // Save the token
//     token.save(function(err) {
//       if (err) {
//         return res.status(500).send({ msg: err.message });
//       }

//       // Send the email
//       var transporter = nodemailer.createTransport({
//         service: 'Sendgrid',
//         auth: {
//           user: process.env.SENDGRID_USERNAME,
//           pass: process.env.SENDGRID_PASSWORD,
//         },
//       });
//       var mailOptions = {
//         from: 'no-reply@codemoto.io',
//         to: user.email,
//         subject: 'Account Verification Token',
//         text:
//           'Hello,\n\n' +
//           'Please verify your account by clicking the link: \nhttp://' +
//           req.headers.host +
//           '/confirmation/' +
//           token.token +
//           '.\n',
//       };
//       transporter.sendMail(mailOptions, function(err) {
//         if (err) {
//           return res.status(500).send({ msg: err.message });
//         }
//         res.json('A verification email has been sent to ' + user.email + '.');
//       });
//     });
//   });
// });

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

router.post(
  '/active/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.id).then(user => {
      console.log('userrrr', user);
      Token.findOne({ _userId: user._id }).then(token => {
        var replacements = {
          firstname: user.firstName,
          token: token.token,
          companyName: user.companyName,
          appURL: appURL,
        };
        let latestFile;
        Manager.findOne()
          .sort('-created')
          .limit(1)
          .then(result => {
            latestFile = result;
          });
        // console.log('latestFile->>>', latestFile);
        user.roles === 'vacuum-dealer'
          ? emailManager(
              __dirname + '/../../templates/NewDealerActivation.html',
              replacements,
              user.email,
              'Your Soniclean Retailer Account has Been Activated',
              __dirname + '/../../public/manager/Privacy-Vacuum-20210915.pdf',
              () => {
                user.passwordResetToken = token.token;
                user.save().then(user => {
                  res.json('verification');
                });
              }
            )
          : emailManager(
              __dirname + '/../../templates/NewDealerActivation.html',
              replacements,
              user.email,
              'Your Soniclean Retailer Account has Been Activated',
              'Mohawk-program-detail.pdf',
              __dirname + `/../../public/manager/${latestFile}`,
              () => {
                user.passwordResetToken = token.token;
                user.save().then(user => {
                  res.json('verification');
                });
              }
            );
      });
    });
  }
);

// @route POST api/users/resetpassword
// @desc Login user and return JWT token
// @access Public
router.post('/resetpassword', (req, res) => {
  const email = req.body.email;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
    var newToken = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString('hex'),
    });

    newToken.save().then(token => {
      var replacements = {
        firstname: user.firstName,
        token: token.token,
        appURL: appURL,
      };
      emailManager(
        __dirname + '/../../templates/NewResetPassword.html',
        replacements,
        user.email,
        'We’ve received an account password reset',
        null,
        null,
        () => {
          user.passwordResetToken = token.token;
          user.save().then(user => {
            res.json(user.email);
          });
        }
      );
    });
  });
});
module.exports = router;
