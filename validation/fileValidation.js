const { ResponseBuilder } = require('../utils/ResponseBuilder');

module.exports.FileValidationOptions = class FileValidationOptions {
  fileTypes = [];
  isRequired = false;
  fieldName = '';
  constructor(fieldName, fileTypes, isRequired) {
    this.fileTypes = Array.isArray(fileTypes) ? fileTypes : [];
    this.isRequired = isRequired;
    this.fieldName = fieldName;
  }
}

module.exports.fileValidation = (fileValidationOptions) => {
  return (req, res, next) => {
    if (!req.file && fileValidationOptions.isRequired) {
      return new ResponseBuilder(res)
        .withStatusCode(422)
        .withStatus('missingFile')
        .withMessage('Missing file')
        .withError({
          [fileValidationOptions.fieldName]: 'Missing file',
        })
        .send();
    }
    
    const splitedFilename = req.file.originalname.split('.');
    const fileType = splitedFilename[splitedFilename.length - 1];
    
    if (!fileValidationOptions.fileTypes.length || fileValidationOptions.fileTypes.includes(fileType)) {
      return next();
    }
    return new ResponseBuilder(res)
      .withStatusCode(422)
      .withStatus('wringFileType')
      .withMessage('Wrong file type')
      .withError({
        [fileValidationOptions.fieldName]: `Wrong file type, available file types - ${fileValidationOptions.fileTypes.join(', ')}`,
      })
      .send();
  }
}
