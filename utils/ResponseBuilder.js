class ResponseBuilder {
  message = '';
  pagination = null;
  items = [];
  statusCode = 200;
  type
  res;
  status = 'ok';
  errors = null;
  
  constructor(res) {
    this.res = res;
  }
  
  static createResponseBuilder(res) {
    return new ResponseBuilder(res);
  }
  
  withType(type) {
    this.type = type;
    return this;
  }
  
  withMessage(message) {
    this.message = message;
    return this;
  }
  
  withPagination(paginationInfo, items) {
    this.pagination = paginationInfo;
    this.items = items || [];
    return this;
  }
  
  withStatusCode(statusCode) {
    this.statusCode = statusCode;
    return this;
  }
  
  withStatus(status) {
    this.status = status;
    return this;
  }
  
  withError(errors) {
    this.errors = errors;
    return this;
  }
  
  send() {
    const response = {};
    if (this.message) response.message = this.message;
    if (this.pagination) {
      response.pagination = {
        perPage: this.pagination.perPage,
        page: this.pagination.page,
        hasMore: this.pagination.hasMore(),
        total: this.pagination.total,
      };
      response.items = this.items;
    }
    if (this.statusCode) {
      this.res.status(this.statusCode)
      response.statusCode = this.statusCode;
    }
    if (this.status) response.status = this.status;
    if (this.errors) response.errors = this.errors;
    
    return this.res.json(response);
  }
}

module.exports.ResponseBuilder = ResponseBuilder;
