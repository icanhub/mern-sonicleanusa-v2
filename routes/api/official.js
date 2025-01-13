const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const keys = require('../../config/keys');
const Token = require('../../models/Token');
const Manager = require('../../models/Manager');
const emailManager = require('../../utils/emailmanager.js');
const appURL =
  process.env.NODE_ENV === 'production'
    ? 'https://dealers.sonicleanusa.com'
    : 'http://dev.dealers.sonicleanusa.com';

const handlebars = require('handlebars');
const fs = require('fs');
const Pagination = require('../../utils/Pagination');
const { DEFAULT_PAGINATION_PAGE } = require('../../utils/consts');
const { convertOrderDirection } = require('../../utils/convertOrderDirection');
const { afterValidation } = require('../../middlewares/afterValidation');
const { getDealersValidator } = require('../../validation/official');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const {
  DEFAULT_PAGINATION_LIMIT,
  orderDirections,
} = require('../../utils/consts');

const mailgun = require('mailgun-js')({
  apiKey: keys.mailGunApiKey,
  domain: keys.mailGunDomain,
});

router.get(
  '/dealers',
  passport.authenticate('jwt', { session: false }),
  ...getDealersValidator,
  afterValidation,
  async (req, res) => {
    const {
      page = DEFAULT_PAGINATION_PAGE,
      perPage = DEFAULT_PAGINATION_LIMIT,
      isVerified = true,
      search = '',
      orderField = '_id',
      orderDirection = 'desc',
    } = req.query;

    const query = {
      roles: { $in: ['dealer', 'vacuum-dealer'] },
      isVerified: isVerified,
    };

    if (search) {
      //If that will work slow you need to add indexes for each of fields that used in search + isVerified
      query.$or = [
        'firstName',
        'lastName',
        'email',
        'company',
        'companyName',
      ].map(fieldName => {
        return {
          [fieldName]: {
            $regex: search,
            $options: 'i',
          },
        };
      });
      const mohawkAccountReg = new RegExp('^[0-9]+$');
      if (mohawkAccountReg.test(search) && search.length <= 6) {
        // when search have only digits and lenght that 6 we can search by mohawkAccount
        if (search.length === 6) query.$or.push({ mohawkAccount: search });
        else {
          const searchAsNumberForAccount = getSearchParameterAsNumber(search);
          //find 2 numbers and search between their values
          query.$or.push({
            mohawkAccount: {
              $gte: searchAsNumberForAccount,
              $lt: getSearchMaxParameterAsNumber(
                search,
                searchAsNumberForAccount
              ),
            },
          });
        }
      }
    }

    const users = await User.find(query, {
      password: 0,
      payments: 0,
      stripe_customer_id: 0,
    })
      .sort({ [orderField]: orderDirections[orderDirection] })
      .skip(+page * +perPage)
      .limit(+perPage)
      .exec();

    const total = await User.find(query).count();

    return ResponseBuilder.createResponseBuilder(res)
      .withStatusCode(200)
      .withPagination(new Pagination(perPage, page, users.length, total), users)
      .send();
  }
);

// calculate amount of zeros that should be added to the search string
function getZerosStringForSearchNumber(search) {
  if (search.length > 6) return '';
  let zerosStr = '';
  for (let i = 0; i < 6 - search.length; i++) zerosStr += '0';
  return zerosStr;
}
// util to make a number from search string that contain only digits
function getSearchParameterAsNumber(search) {
  if (search.length === 6) return search;
  const zeros = getZerosStringForSearchNumber(search);
  return zeros === '' ? 0 : +(search + zeros);
}
//util to get max number for search
function getSearchMaxParameterAsNumber(search, searchAsNumberForAccount) {
  const zeros = getZerosStringForSearchNumber(search);
  return zeros === '' ? 1000000 : +searchAsNumberForAccount + +('1' + zeros);
}

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

router.put(
  '/activate/:storeId/:dealerId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.params.dealerId).then(user => {
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.phoneNumber = req.body.phoneNumber;
      user.companyName = req.body.companyName;
      user.websiteURL = req.body.websiteURL;
      user.mohawkAccount = req.body.mohawkAccount;
      user.mohawkBrand = req.body.mohawkBrand;

      let new_store = {};
      new_store.address1 = req.body.address1;
      new_store.address2 = req.body.address2;
      new_store.city = req.body.city;
      new_store.us_state = req.body.us_state;
      new_store.zipcode = req.body.zipcode;

      const store = user.stores.id(req.params.storeId);
      if (store) {
        store.set(new_store);
      } else {
        return res.status(404).json({ message: 'cannot find the store' });
      }

      user
        .save()
        .then(user => {
          // console.log('dirnameeee->>', __dirname);
          Token.findOne({ _userId: user._id }).then(token => {
            if (!token) {
              return res.status(404).json({ message: 'token not found' });
            }
            var replacements = {
              firstname: user.firstName,
              token: token.token,
              companyName: user.companyName,
              appURL: appURL,
            };
            Manager.findOne()
              .sort('-created')
              .limit(1)
              .then(result => {
                // console.log('dirnameeee->>', __dirname);
                readHTMLFile(
                  __dirname + '/../../templates/NewDealerActivation.html',
                  function(err, html) {
                    var template = handlebars.compile(html);
                    var htmlToSend = template(replacements);
                    if (user.roles === 'vacuum-dealer') {
                      // ? {
                      //     from:
                      //       process.env.NODE_ENV === 'production'
                      //         ? `Soniclean Dealer Support <${
                      //             require('../../config/keys').productionEmail
                      //           }>`
                      //         : `Soniclean Dealer Support <${
                      //             require('../../config/keys')
                      //               .developmentEmail
                      //           }>`,
                      //     to: user.email,
                      //     cc:
                      //       process.env.NODE_ENV === 'production'
                      //         ? require('../../config/keys').productionEmail
                      //         : require('../../config/keys').developmentEmail,
                      //     subject: `Your Soniclean Retailer Account has Been Activated`,
                      //     html: htmlToSend,
                      //     attachment:
                      //       __dirname +
                      //       `/../../public/manager/Privacy-Vacuum-20210301.pdf`,
                      //   }
                      emailManager(
                        __dirname + '/../../templates/NewDealerActivation.html',
                        replacements,
                        user.email,
                        `Your Soniclean Retailer Account has Been Activated`,
                        'Vacuum Dealer program detail.pdf',
                        __dirname +
                          `/../../public/manager/Privacy-Vacuum-20210915.pdf`,
                        () => {
                          console.log(
                            'Success Soniclean Vacuum Dealer Account activation email sent!'
                          );
                        }
                      );
                    }
                    // : {
                    //     from:
                    //       process.env.NODE_ENV === 'production'
                    //         ? `Soniclean Dealer Support <${
                    //             require('../../config/keys').productionEmail
                    //           }>`
                    //         : `Soniclean Dealer Support <${
                    //             require('../../config/keys')
                    //               .developmentEmail
                    //           }>`,
                    //     to: user.email,
                    //     cc:
                    //       process.env.NODE_ENV === 'production'
                    //         ? require('../../config/keys').productionEmail
                    //         : require('../../config/keys').developmentEmail,
                    //     subject: `Your Soniclean Retailer Account has Been Activated`,
                    //     html: htmlToSend,
                    //     attachment:
                    //       __dirname +
                    //       `/../../public/manager/${result.uploadfile}`,
                    //   };
                    else {
                      emailManager(
                        __dirname + '/../../templates/NewDealerActivation.html',
                        replacements,
                        user.email,
                        `Your Soniclean Retailer Account has Been Activated`,
                        'Mohawk/Karastan Dealer program detail.pdf',
                        __dirname +
                          `/../../public/manager/${result.uploadfile}`,
                        () => {
                          console.log(
                            'Success Soniclean Mohawk/karastan Dealer Account activation email sent!'
                          );
                        }
                      );
                    }

                    // mailgun.messages().send(data, function(error, body) {
                    //   if (error) {
                    //     console.log(error);
                    //   }
                    // console.log('Success Dealer Activated Email!');
                    user.passwordResetToken = token.token;
                    user.isVerified = true;
                    user.save().then(user => {
                      if (!user) {
                        return res
                          .status(404)
                          .json({ message: 'cannot find user' });
                      }
                      let query = {
                        roles: 'dealer',
                        isVerified: false,
                      };

                      User.find(query).then(response => {
                        var result = {
                          message: 'Success Activate a Dealer!',
                          data: response,
                        };
                        res.json(result);
                      });
                    });
                    // });
                  }
                );
              });
          });
        })
        .catch(err => console.log(err));
    });
  }
);

router.delete(
  '/delete/:id/:isVerified',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
      if (!user) {
        res.status(404).json({ message: 'user not find' });
      } else {
        let query = { roles: 'dealer', isVerified: req.params.isVerified };

        User.find(query).then(response => {
          var result = {
            type: req.params.isVerified,
            message: 'Success Delete a Dealer!',
            data: response,
          };
          res.json(result);
        });
      }
    });
  }
);

module.exports = router;
