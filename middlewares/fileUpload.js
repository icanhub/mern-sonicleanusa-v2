const multer = require('multer');
const Path = require('path');
const { fileValidation } = require('../validation/fileValidation');
 
const defaultPath = './public';

module.exports.UploadFileOptions = class UploadFileOptions {
  constructor(fieldName, path, validationOptions) {
    this.fieldName = fieldName;
    this.path = path;
    this.validationOptions = validationOptions;
  }
};

module.exports.uploadFileMiddleware = uploadFileOptions => {
  const result = [];
  
  result.push(
    multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadFileOptions.path || defaultPath);
        },
        filename: function(req, file, cb) {
          cb(null, Date.now() + Path.extname(file.originalname));
        },
      }),
    }).single(uploadFileOptions.fieldName)
  );

  if (uploadFileOptions?.validationOptions) {
    result.push(fileValidation(uploadFileOptions.validationOptions));
  }

  return result;
};
