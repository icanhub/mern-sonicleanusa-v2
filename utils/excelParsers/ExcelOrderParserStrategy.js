const { EXCEL_TYPES, ExcelParserStrategy } = require('./ExcelParserStrategy');

class ExcelOrderParserStrategy extends ExcelParserStrategy {
  type = EXCEL_TYPES.ORDERS;
  
  execute() {
    if (this.error) return;
    
    const result = this.rows.reduce((acc, order) => {
      if (!acc[order.order_number]) acc[order.order_number] = {items: []};
      const currentOrder = acc[order.order_number];
      
      currentOrder.payment_type = order.payment_type === 'Credit/Debit' ? 'stripe' : order.payment_type;
      currentOrder.mohawk_account = order.mohawk_account;
      currentOrder.success_code = true;
      currentOrder.cust_ref = order.order_number;
      currentOrder.order_number = order.order_number;
      currentOrder.created = order.created;
      currentOrder.orderEmails = order.orderEmails;
      currentOrder.dealeremail = order.orderEmails;
      currentOrder.order_status = order.order_status;
      currentOrder.ship_company = order.ship_company;
      currentOrder.sub_total = order.sub_total;
      currentOrder.ship_first_name = order.ship_first_name;
      currentOrder.ship_last_name = order.ship_last_name;
      currentOrder.ship_address_1 = order.ship_address_1;
      currentOrder.ship_address_2 = order.ship_address_2;
      currentOrder.vacuum_account_number = order.mohawk_account;
      currentOrder.ship_city = order.ship_city;
      currentOrder.ship_state = order.ship_state;
      currentOrder.ship_zip = order.ship_zip;
      currentOrder.ship_phone = order.ship_zip;
      currentOrder.ship_e_mail = order.ship_e_mail;
      currentOrder.ship_e_mail = order.ship_e_mail;
      currentOrder.trackingNumber = order.tracking_no;
      currentOrder.items.push({
        item: order.item,
        name: order.name,
        model: `(Model: ${order.item})`,
        quantity: order.quantity,
        price: order.price,
        imageurl: '',
        discount: order.discount !== undefined ? Number(order.discount) : 0,
        sub_total: Number(order.sub_total),
      });
      currentOrder.discount = order.discount;
      
      return acc;
    }, {});
    
    return Object.keys(result).reduce((acc, key) => {
      acc.push(result[key]);
      return acc;
    }, []);
  }
}

module.exports.ExcelOrderParserStrategy = ExcelOrderParserStrategy;
