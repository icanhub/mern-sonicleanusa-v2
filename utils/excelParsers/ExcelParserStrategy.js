const { orderXlsxSchema } = require('../consts');
const { ResponseBuilder } = require('../ResponseBuilder');
const fs = require('fs/promises');
const xlsxFile = require('read-excel-file/node');

const EXCEL_TYPES = {
  ORDERS: 'orders',
}

const excelSchemaConfig = {
  [EXCEL_TYPES.ORDERS]: orderXlsxSchema,
}

class ExcelStrategyExecutor {
  strategy;
  
  static create() {
    return new ExcelStrategyExecutor();
  }
  
  set(strategy) {
    this.strategy = strategy;
    return this;
  }
  
  async execute() {
    await this.strategy.parse();
    await this.strategy.clear();
    return this.strategy.execute();
  }
}

class ExcelParserStrategy {
  response;
  type;
  rows;
  filePath;
  error = false;
  constructor(response, filePath) {
    this.response = response;
    this.filePath = filePath;
  }
  
  async parse() {
    const { rows, errors } = await xlsxFile(this.filePath, {
      schema: excelSchemaConfig[this.type],
    }).catch((error) => {
      return {
        rows: [],
        errors: [error],
      }
    });
  
    if (errors.length) {
      this.error = true;
      ResponseBuilder
        .createResponseBuilder(this.response)
        .withStatusCode(400)
        .withStatus('failed')
        .withMessage('Error in scraping excel file')
        .send();
    } else {
      this.rows = rows;
    }
    
    return this;
  }
  
  execute() {
    throw new Error('Implement execute for strategy');
  }
  
  async clear() {
    await fs.unlink(this.filePath);
  }
}

module.exports.EXCEL_TYPES = EXCEL_TYPES;
module.exports.excelSchemaConfig = excelSchemaConfig;
module.exports.ExcelStrategyExecutor = ExcelStrategyExecutor;
module.exports.ExcelParserStrategy = ExcelParserStrategy;
