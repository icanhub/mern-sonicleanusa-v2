import React from 'react';
import logo from '../../assets/img/brand/logo.png';
import moment from 'moment-timezone';
import HH_0800 from '../../assets/img/HH-0800.jpg';
import KSC_7500 from '../../assets/img/KSC-7500.jpg';
import SFC_7000 from '../../assets/img/SFC-7000.jpg';
import SFP_0100 from '../../assets/img/SFP-0100.jpg';
import SHF_0800 from '../../assets/img/SHF-0800.jpg';
import SUF_0520 from '../../assets/img/SUF-0520.jpg';
import STV_1 from '../../assets/img/STV-1.jpg';
import karastandisplay from '../../assets/img/karastandisplay.jpg';
import mohawkdisplay from '../../assets/img/mohawkdisplay.jpg';
class Print extends React.Component {
  getImageUrl = imageurl => {
    let obj;
    switch (imageurl) {
      case 'HH_0800':
        obj = HH_0800;
        break;
      case 'KSC_7500':
        obj = KSC_7500;
        break;
      case 'SFC_7000':
        obj = SFC_7000;
        break;
      case 'SFP_0100':
        obj = SFP_0100;
        break;
      case 'SHF_0800':
        obj = SHF_0800;
        break;
      case 'SUF_0520':
        obj = SUF_0520;
        break;
      case 'STV-1':
        obj = STV_1;
        break;
      case 'karastandisplay':
        obj = karastandisplay;
        break;
      case 'mohawkdisplay':
        obj = mohawkdisplay;
        break;

      default:
        break;
    }
    return obj;
  };

  render() {
    const {
      ship_first_name,
      ship_last_name,
      ship_address_1,
      ship_address_2,
      ship_city,
      ship_state,
      ship_zip,
      ship_e_mail,
      ship_phone,
      ship_company,
      mohawk_account_number,
      order_number,
      created,
      items,
      sub_total,
      discount,
      payment_type,
      mohawk_order_status,
      mohawk_po_file
    } = this.props.printData;

    const h5Style = {
      padding: 3,
      margin: 0,
      fontSize: '1rem'
    };
    const h6Style = {
      padding: 3,
      margin: 0,
      fontSize: '1.2rem'
    };

    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
        <div style={{ padding: 50, paddingTop: 30 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#eceff1',
              alignItems: 'center',
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }}
          >
            <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
              <img src={logo} alt="logo" style={{ width: 180 }} />
            </div>
            <div>
              <h5 style={{ fontWeight: 'bold' }}>Order #: {order_number}</h5>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              paddingLeft: 10,
              marginTop: 25
            }}
          >
            <div style={{ width: '50%' }}>
              <h5 style={{ h5Style, marginBottom: '10px', fontWeight: 'bold' }}>
                Shipping Information:
            </h5>
              <h6 style={h6Style}>
                {ship_first_name} {ship_last_name}
              </h6>
              <h6 style={h6Style}>{ship_address_1}</h6>
              <h6 style={h6Style}>{ship_address_2}</h6>
              <h6 style={h6Style}>{ship_city}, {ship_state} {ship_zip}</h6>
              <h6 style={h6Style}>{ship_e_mail}</h6>
              <h6 style={h6Style}>{ship_phone}</h6>
              {order_number.split('.')[1] !== 'DS' && (
                <>
                  <h6 style={h6Style}>{ship_company}</h6>
                </>
              )}
            </div>
            <div>
              <h5 style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                Account/Order Information:
            </h5>
              <h6 style={h6Style}>Order #: {order_number}</h6>
              <h6 style={h6Style}>
                Order Date:{' '}
                {moment(created)
                  .tz('America/New_York')
                  .format('MM/DD/YY hh:mm A z')}
              </h6>
              <h6 style={h6Style}>
                Order Type:{' '}
                {order_number &&
                  order_number.split('.')[1] === 'DS'
                  ? 'Direct Ship'
                  : order_number.split('.')[1] === 'DSS'
                    ? 'Direct Ship Store'
                    : order_number && order_number.split('.')[1] === 'MKT'
                      ? 'Marketing'
                      : order_number && order_number.split('.')[1] === 'DEM'
                        ? 'Demo'
                        : 'Inventory'}
              </h6>
              <h6 style={h6Style}>
                Payment Method:{' '}
                {payment_type === 'freepaid'
                  ? 'No Charge'
                  : payment_type === 'stripe'
                    ? 'Credit/Debit Card'
                    : 'Mohawk'}
              </h6>
              {
                this.props.invoiced && <h6 style={h6Style}>Invoiced: {this.props.invoiced}</h6>
              }
              <h6 style={h6Style}>Payment Status: {this.props.paymentStatus}</h6>
              {(mohawk_order_status === 'approved' ||
                mohawk_order_status === 'released') && (
                  <h6 style={h6Style}>
                    PO (MHK):{' '}
                    {mohawk_po_file}
                  </h6>)}
              <h6 style={h6Style}>
                Shipping Status: {this.props.shippingStatus}
              </h6>
              <h6 style={h6Style}>Account #: {mohawk_account_number}</h6>
            </div>
          </div>
          {items &&
            items.map((item, index) => {
              return (
                <div key={index}>
                  <div
                    style={{
                      width: '100%',
                      height: 1,
                      backgroundColor: '#e6e9eb',
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  ></div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                      key={index}
                    >
                      <div style={{ marginRight: 20 }}>
                        <img
                          src={this.getImageUrl(item.imageurl)}
                          alt="hh_0800"
                          style={{ width: 100 }}
                        />
                      </div>
                      <div>
                        <h5 style={h5Style}><strong>{item.name}</strong></h5>
                        <h5 style={h5Style}>QTY: {item.quantity}</h5>
                        <h5 style={h5Style}>
                          Unit Price: ${Number(item.price).toFixed(2)}
                        </h5>
                      </div>
                    </div>

                    <div ><h5 style={h5Style}>${Number(item.price * item.quantity).toFixed(2)}</h5></div>
                  </div>
                </div>
              );
            })}
          <div
            style={{
              width: '100%',
              height: 1,
              backgroundColor: '#e6e9eb',
              marginTop: 10,
              marginBottom: 10,
            }}
          ></div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 20,

            }}
          >

            <div style={{ marginTop: 20, textAlign: 'left', }}>
              {
                this.props.shippingStatus === 'Shipped' && <><h5>Tracking Numbers</h5>
                  <h5 style={{ marginTop: 10 }}>{this.props.trackingNumbers}</h5></>
              }

            </div>
            <div style={{ marginRight: 20, textAlign: 'right', width: 200 }}>
              <h5 style={{ marginBottom: 10, }}>Subtotal: ${Number(sub_total).toFixed(2)}</h5>
              <h5 style={{ marginBottom: 10, textAlign: 'right' }}>Tax: $0.00</h5>
              <h5 style={{ marginBottom: 10, textAlign: 'right' }}>Shipping: $0.00</h5>
              <h5 style={{ marginBottom: 15 }}>Discount: ${Number(discount).toFixed(2)}</h5>
              <div
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: '#e6e9eb',
                  marginTop: 10,
                  marginBottom: 15,
                }}
              ></div>
              <h4 style={{ marginBottom: 10, fontWeight: 'bold' }}>Total: ${Number(Number(sub_total) - Number(discount)).toFixed(2)}</h4>
            </div>
          </div>
          <div style={{ display: 'inline-block', textAlign: 'center', position: 'absolute', bottom: 20, right: 50, left: 50, backgroundColor: '#eceff1', paddingTop: 15, paddingBottom: 15, }}>
            <h5 style={h5Style}>@2020 Soniclean</h5>
            <h5 style={h5Style}>Web: dealers.sonicleanusa.com</h5>
            <h5 style={h5Style}>Phone (Dealer Support): (954) 228-9100</h5>
            <h5 style={h5Style}>Phone (For Customers): (954) 500-0907</h5>
          </div>
        </div>
      </div >
    );
  }
}

export default Print;
