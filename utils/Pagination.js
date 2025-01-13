module.exports = class Pagination {
  constructor(perPage, page, currentLength, total) {
    this.page = +page;
    this.perPage = +perPage;
    this.currentLength = +currentLength;
    this.total = total;
  }
  
  hasMore() {
    const currentDocumentsFetched = this.perPage * this.page + this.currentLength;
    return this.total > currentDocumentsFetched;
  }
}
