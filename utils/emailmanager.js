const keys = require('../config/keys');
var handlebars = require('handlebars');
var fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

var aws_remote_config = {
  accessKeyId: 'AKIAXV66VW3EIPQ6MHY4',
  secretAccessKey: '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',
  region: 'us-east-2',
};

AWS.config.update(aws_remote_config);

const awsConfig = {
  conf: aws_remote_config,
  ses: new AWS.SES({ apiVersion: '2010-12-01' }),
};

let transporter = nodemailer.createTransport({
  SES: awsConfig.ses,
});

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

module.exports = function(
  path,
  replacements,
  target,
  subject_text = 'Unknown',
  name = null,
  attachment = null,
  callback
) {
  console.log('email path->>', path);
  readHTMLFile(path, async function (err, html) {
    var template = handlebars.compile(html);
    var htmlToSend = template(replacements);
    let info = {
      from:
        process.env.NODE_ENV === 'production'
          ? `Soniclean Dealer Support <${require('../config/keys').productionEmail
            }>`
          : `Soniclean Dealer Support <${require('../config/keys').developmentEmail
            }>`,
      to: target,
      bcc:
        process.env.NODE_ENV === 'production'
          ? require('../config/keys').productionEmailAlias
          : require('../config/keys').developmentEmail, //dev@sonicleanusa.com,
      subject: subject_text, // Subject line
      attachments: attachment
        ? [
            {
              filename: name,
              path: attachment,
            },
          ]
        : [],
      html: htmlToSend, // html version
    };
    await transporter.sendMail(info, function(error, body) {
      if (error) {
        console.log(error);
      }
      callback();
    });
  });
};
