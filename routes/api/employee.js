const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');

// Load input validation
const validateEmployeeInput = require('../../validation/employee');
const Token = require('../../models/Token');

const emailManager = require('../../utils/emailmanager.js');

// Load User model
const User = require('../../models/User');
const Manager = require('../../models/Manager');
const Notes = require('../../models/Notes');

// @route POST api/users/register
// @desc Register user
// @access Public
router.post(
  '/new/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Form validation

    let defaultPassword = 'test123';

    const { errors, isValid } = validateEmployeeInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        const newUser = new User({
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          companyName: req.body.companyName,
          mohawkAccount: req.body.mohawkAccount ? req.body.mohawkAccount : '',
          vacuumAccount: req.body.vacuumAccount ? req.body.vacuumAccount : '',
          mohawkBrand: req.body.mohawkBrand ? req.body.mohawkBrand : '',
          roles: 'employee',
          _adminId: req.params.id,
        });

        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(defaultPassword, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                var newToken = new Token({
                  _userId: user._id,
                  token: crypto.randomBytes(16).toString('hex'),
                });

                newToken.save().then(token => {
                  User.findById(req.params.id).then(dealer => {
                    var replacements = {
                      firstname: user.firstName,
                      dealername: dealer.firstName + ' ' + dealer.lastName,
                      companyname: dealer.companyName,
                      token: token.token,
                    };

                    let latestFile;
                    Manager.findOne()
                      .sort('-created')
                      .limit(1)
                      .then(result => {
                        dealer.roles === 'vacuum-dealer'
                          ? emailManager(
                              __dirname +
                                '/../../templates/NewUserInvitation.html',
                              replacements,
                              user.email,
                              `${dealer.companyName} has sent you an invitation to access their Soniclean Dealer Account`,
                              'Vacuum-program-detail.pdf',
                              __dirname +
                                '/../../public/manager/Privacy-Vacuum-20210915.pdf',
                              () => {
                                User.find({ _adminId: req.params.id }).then(
                                  employees => {
                                    res.json(employees);
                                  }
                                );
                              }
                            )
                          : emailManager(
                              __dirname +
                                '/../../templates/NewUserInvitation.html',
                              replacements,
                              user.email,
                              `${dealer.companyName} has sent you an invitation to access their Soniclean Dealer Account`,
                              'Mohawk-program-detail.pdf',
                              __dirname +
                                `/../../public/manager/${result.uploadfile}`,
                              () => {
                                User.find({ _adminId: req.params.id }).then(
                                  employees => {
                                    res.json(employees);
                                  }
                                );
                              }
                            );
                      });
                  });
                });
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //   res.send(req.user)
    User.find({ _adminId: req.params.id }).then(employees => {
      res.json(employees);
    });
  }
);

router.delete(
  '/delete/:id/:dealer',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
      if (user) {
        User.find({ _adminId: req.params.dealer }).then(employees => {
          res.json(employees);
        });
      } else {
        return res.status(400).json({ message: 'Cannot find the employee.' });
      }
    });
  }
);

// CRUD apis for notes

router.post(
  '/notes/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOne({ _id: req.params.id }).then(user => {
      if (user) {
        const noteObj = {
          note: req.body.note,
          created: new Date().toISOString(),
        };
        user.notes.push(noteObj);
        user.save().then(res.status(200).send(user.notes));
      }
    });
  }
);

router.get(
  '/getnotes/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOne({ _id: req.params.id }).then(user => {
      if (user) res.status(200).send(user.notes);
    });
  }
);

router.put(
  '/updatenote/:id/:dealer',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.dealer).then(user => {
      const notefound = user.notes.id(req.params.id);
      if (notefound) {
        notefound.note = req.body.newNote;
        notefound.created = Date.now();
      } else {
        return res.status(404).json({ message: 'cannot find the note' });
      }

      user
        .save()
        .then(user => {
          res.json(user.notes);
        })
        .catch(err => console.log(err));
    });
  }
);

router.delete(
  '/deletenote/:id/:dealer',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    User.findById(req.params.dealer).then(user => {
      if (user.notes.id(req.params.id)) {
        user.notes.id(req.params.id).remove();
      } else {
        return res.status(404).json({ message: 'cannot find the note' });
      }

      user
        .save()
        .then(user => {
          res.json(user.notes);
        })
        .catch(err => console.log(err));
    });
  }
);

module.exports = router;
