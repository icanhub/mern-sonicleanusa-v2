const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../../models/User');
const Manager = require('../../models/Manager');
const Karastan = require('../../models/Karastan');
const crypto = require('crypto');
const xlsxFile = require('read-excel-file/node');
const Pagination = require('../../utils/Pagination');
const fs = require('fs');
const fsPromised = require('fs/promises');
const { UploadFileOptions } = require('../../middlewares/fileUpload');
const { uploadFileMiddleware } = require('../../middlewares/fileUpload');
const { karastanExcelSchema } = require('../../utils/consts');
const { emptyFunction } = require('../../utils/emptyFunction');
const {
  FileValidationOptions,
  fileValidation,
} = require('../../validation/fileValidation');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');

/* GET dealers list */
router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let query = { roles: 'official' };

    User.find(query).then(response => {
      res.json(response);
    });
  }
);

var readHTMLFile = function(path, callback) {
  fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

router.post(
  '/new',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Form validation

    let defaultPassword = 'test123';

    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        const newUser = new User({
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          isVerified: true,
          roles: 'official',
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
                  User.find({ roles: 'official' }).then(users => {
                    res.json(users);
                  });

                  //   var transporter = modemailer.createTransport({
                  //     service: 'gmail',
                  //     auth: {
                  //       user: 'wonder.dev21@gmail.com',
                  //       pass: 'aksrudeo101668',
                  //     },
                  //   });
                  //   var mailOptions = {
                  //     from: 'wonder.dev21@gmail.com',
                  //     to: user.email,
                  //     subject: 'Account Verification Token',
                  //     text:
                  //       'Hello,\n\n' +
                  //       'Please verify your account by clicking the link: \nhttp://' +
                  //       req.headers.host +
                  //       '/confirmation/' +
                  //       token.token +
                  //       '.\n',
                  //   };
                  //   transporter.sendMail(mailOptions, function(err) {
                  //     if (err) {
                  //       return res.status(500).json({ message: err.message });
                  //     }
                  //     //   res.json({message: 'A verification email has been sent to ' + user.email + '.'});
                  //     User.find({ _adminId: req.params.id }).then(employees => {
                  //       res.json(employees);
                  //     });
                  //   });
                });
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
);

router.delete(
  '/delete/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
      if (!user) console.log(error);
      else {
        User.find({ roles: 'official' }).then(users => {
          res.json(users);
        });
      }
    });
  }
);

router.get(
  '/uploadfile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Manager.findOne()
      .sort('-created')
      .limit(1)
      .then(result => {
        res.json(result);
      });
  }
);

router.post(
  '/karastan',
  passport.authenticate('jwt', { session: false }),
  ...uploadFileMiddleware(
    new UploadFileOptions(
      'file',
      './public/karastanexcel',
      new FileValidationOptions('file', ['xlsx'], true)
    )
  ),
  async (req, res) => {
    const { rows, errors } = await xlsxFile(req.file.path, { schema: karastanExcelSchema });
    
    if (errors.length) {
      return ResponseBuilder
        .createResponseBuilder(res)
        .withStatusCode(400)
        .withMessage('Error in scraping excel file')
        .withError(errors)
        .send();
    }
  
    console.log('rows::', rows);
    await Karastan.collection.drop().catch(emptyFunction);
    await Karastan.insertMany(rows);
    await fsPromised.unlink(req.file.path);
    
    return ResponseBuilder
      .createResponseBuilder(res)
      .withStatusCode(200)
      .withMessage('Karastans successfully updated')
      .send();
  }
);

router.get(
  '/karastan',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const karastans = await Karastan.find().exec();

    return ResponseBuilder
      .createResponseBuilder(res)
      .withStatusCode(200)
      .withPagination(new Pagination(1, 0, 1, 1), karastans)
      .send();
  }
);

module.exports = router;
