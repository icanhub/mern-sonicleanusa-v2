const { orderDirections } = require('./consts');
 
module.exports.convertOrderDirection = (orderDirectionKey) => {
  return orderDirections[orderDirectionKey] > 0 ? '$gt' : '$lt'
}
