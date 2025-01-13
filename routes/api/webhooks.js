const keys = require('../../config/keys');

const axios = require('axios');
const moment = require('moment-timezone');
const Orders = require('../../models/Orders');
const emailManager = require('../../utils/emailmanager.js');

module.exports = function(socket, id) {
  let query = {};
  if (id) {
    query['createdBy'] = id;
  }

  Orders.find(query)
    .sort({ created: 'desc' })
    .then(orders => {
      Promise.all(
        orders.map(async order => {
          let p = await axios.get(
            `https://api.cartrover.com/v1/cart/orders/${order.cust_ref}?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`
          );
          let pd = await p.data;
          // let l = await axios.get(
          //   `https://api.cartrover.com/v1/cart/orders/status/${order.cust_ref}?api_user=${keys.CartRoverApiUser}&api_key=${keys.CartRoverApiKey}`
          // );
          // let ld = await l.data;
          if (order.order_status === 'In process') {
            if (pd.success_code) {
              if (pd.response.shipments.length > 0) {
                // console.log(order.orderEmails, pd.response.shipments);

                order.order_status = 'shipped';
                order.save().then(order => {
                  var replacements = {
                    order_number: pd.response.cust_ref,
                    order_date: moment(pd.response.shipments[0].date)
                      .tz('America/New_York')
                      .format('MM/DD/YYYY hh:mm A z'),
                    payment_type: 'VISA',
                    order_type:
                      pd.response.cust_ref.split('.')[1] === 'INV'
                        ? 'Inventory'
                        : pd.response.cust_ref.split('.')[1] === 'DS' ||
                          pd.response.cust_ref.split('.')[1] === 'DSS'
                        ? 'Direct Ship'
                        : pd.response.cust_ref.split('.')[1] === 'DEM'
                        ? 'Demo'
                        : 'Other',
                    ship_name:
                      pd.response.ship_first_name +
                      ' ' +
                      pd.response.ship_last_name,
                    ship_address_1: pd.response.ship_address_1,
                    ship_address_2: pd.response.ship_address_2,
                    ship_city: pd.response.ship_city,
                    ship_state: pd.response.ship_state,
                    ship_zip: pd.response.ship_zip,
                    ship_country: pd.response.ship_country,
                    total: pd.response.amount || 0,
                    items: pd.response.items,
                    trackingNumber: pd.response.shipments[0].tracking_no,
                  };
                  emailManager(
                    __dirname +
                      '/../../templates/DealerEmailShippingConfirmation.html',
                    replacements,
                    order.orderEmails,
                    null,
                    null,
                    () => {
                      console.log('success!');
                    }
                  );
                });

                // if (order.cust_ref.split('.')[1] === 'DS') {
                //   var replacements_customer = {
                //     order_number: pd.response.cust_ref,
                //     order_company: order.cust_company,
                //     order_date: moment(orderData.created).format(
                //       'MM/DD/YYYY h:mm:ss a'
                //     ),
                //     payment_type: 'VISA',
                //     order_type:
                //       req.body.order.cust_ref.split('.')[1] === 'INV'
                //         ? 'Inventory'
                //         : req.body.order.cust_ref.split('.')[1] === 'DS' ||
                //           req.body.order.cust_ref.split('.')[1] === 'DSS'
                //         ? 'Direct Ship'
                //         : req.body.order.cust_ref.split('.')[1] === 'DEM'
                //         ? 'Demo'
                //         : 'Other',
                //     ship_name:
                //       req.body.order.ship_first_name +
                //       ' ' +
                //       req.body.order.ship_last_name,
                //     ship_address_1: req.body.order.ship_address_1,
                //     ship_address_2: req.body.order.ship_address_2,
                //     ship_city: req.body.order.ship_city,
                //     ship_state: req.body.order.ship_state,
                //     ship_zip: req.body.order.ship_zip,
                //     ship_country: req.body.order.ship_country,
                //     items: req.body.order.items,
                //   };

                //   emailManager(
                //     __dirname +
                //       '/../../templates/DealerEmailShippingConfirmation.html',
                //     replacements_customer,
                //     targetEmails.toString(),
                //     () => {
                //       console.log('success!');
                //     }
                //   );
                // }
              }
            }
          }
          return {
            _id: order._id,
            payment_type: order.payment_type,
            mohawk_account: order.mohawk_account,
            mohawk_invoice: order.mohawk_invoice,
            _createdBy: order.createdBy,
            success_code: pd.success_code,
            cust_ref: pd.success_code ? pd.response.cust_ref : '',
            created: pd.success_code ? pd.response.created_date_time : '',
            ship_company: pd.success_code ? pd.response.ship_company : '',
            sub_total: pd.success_code ? pd.response.sub_total : '',
            ship_first_name: pd.success_code ? pd.response.ship_first_name : '',
            ship_last_name: pd.success_code ? pd.response.ship_last_name : '',
            ship_address_1: pd.success_code ? pd.response.ship_address_1 : '',
            ship_address_2: pd.success_code ? pd.response.ship_address_2 : '',
            ship_city: pd.success_code ? pd.response.ship_city : '',
            ship_state: pd.success_code ? pd.response.ship_state : '',
            ship_zip: pd.success_code ? pd.response.ship_zip : '',
            ship_phone: pd.success_code ? pd.response.ship_phone : '',
            ship_e_mail: pd.success_code ? pd.response.ship_e_mail : '',
            order_status:
              pd.success_code && pd.response.shipments.length > 0
                ? 'shipped'
                : 'new',
          };
        })
      ).then(response => {
        var data = {
          data: response,
        };
        socket.emit('getOrders', data.data);
      });
    });
};
