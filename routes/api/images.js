const express = require('express');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const mime = require('mime');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb(null, 'logo-' + Date.now() + '.' + filetype);
  },
});
var upload = multer({ storage: storage });

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

router.put(
  '/userphoto/:id',
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    var matches = req.body.file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], 'base64');
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    let fileName = 'image-' + Date.now() + '.' + extension;
    try {
      fs.writeFileSync('./public/uploads/' + fileName, imageBuffer, 'utf8');
      // return res.send({"status":"success"});
      User.findById(req.params.id).then(user => {
        user.userPhoto = fileName;
        user
          .save()
          .then(user => {
            res.json(user.userPhoto);
          })
          .catch(err => console.log(err));
      });
    } catch (e) {
      next(e);
    }
  }
);

router.put(
  '/companylogo/:id',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  function(req, res, next) {
    if (!req.file) {
      res.status(401).json({ error: 'Please provide an image' });
      return;
    }

    User.findById(req.params.id).then(user => {
      user.companyLogo = req.file.filename;
      user
        .save()
        .then(user => {
          res.json(user.companyLogo);
        })
        .catch(err => console.log(err));
    });
  }
);

module.exports = router;
