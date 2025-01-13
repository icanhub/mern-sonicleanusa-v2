const { ExcelOrderParserStrategy } = require('./ExcelOrderParserStrategy');
const { EXCEL_TYPES } = require('./ExcelParserStrategy');

module.exports.createParserStrategy = (type, response, filePath) => {
  switch (type) {
    case EXCEL_TYPES.ORDERS:
      return new ExcelOrderParserStrategy(response, filePath);
  }
}
