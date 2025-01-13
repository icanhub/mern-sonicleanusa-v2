import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { notification } from '../../../../utils/notification';
import { history } from '../../../../_helpers/history';
import Stats from '../Stats';
import PaymentMethod from '../PaymentMethod';
import PaymentShipping from '../PaymentShipping';
import EmailNotification from '../EmailNotification';
import ProductBox from '../ProductBox';
import ProductInfo from '../ProductInfo';
import Discount from '../Discount';
// import ScrollTop from '../ScrollTop'
import AddPaymentMethodModal from '../../../../components/AddPaymentMethodModal/AddPaymentMethodModal';
import MohawkPaymentMethod from '../MohawkPaymentMethod';
import FreePaidMethod from '../FreePaidMethod';
import * as Contants from '../../../../_config/constants';
import { fetchCards } from '../../../../reducers/cards';
import {
  onSelectCard,
  onSubmitOrder,
  submitOrderReset,
} from '../../../../reducers/salesForm';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import { isAdmin, isDealer, isVacuumDealer, isManager } from '../../../../_helpers/helper';
import { isPending, hasSucceeded, hasFailed } from '../../../../utils/state';
import './Payment.scss';
import { isOfficial } from '../../../../_helpers/helper';

const Payment = ({
  orderType,
  fetchCards,
  cardsData,
  selectCard,
  selectedCard,
  ship,
  employeeFirstName,
  employeeLastName,
  selectedUsers,
  selectedStore,
  storesData,
  submitOrder,
  state,
  shippinginfor,
  inventory,
  customerInformation,
  resetOrder,
  accountData,
  cardLoadingState,
  user,
  discount,
  orderResponseData,
  ...props
}) => {
  const [modal, setModal] = useState(false);
  const [POnumber, setPOnumber] = useState('');

  const [totalPrice, setTotalPrice] = useState(0);

  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (
      accountData.roles === 'dealer' ||
      accountData.roles === 'vacuum-dealer'
    ) {
      fetchCards(accountData._id);
    } else if (accountData.roles === 'employee') {
      fetchCards(accountData._adminId);
    }
  }, []);

  const onSelectCard = id => {
    selectCard(id);
  };

  let total = 0;
  const getTotalPrice = price => {
    total += price;
    setTotalPrice(total);
  };

  const onResetOrder = () => {
    if (hasSucceeded(state)) {
      history.push(`/order/${orderResponseData._id}`);
      resetOrder();
    } else {
      if (
        accountData.roles !== 'vacuum-dealer' &&
        accountData.roles !== 'dealer' &&
        accountData.roles !== 'employee'
      )
        history.push(`/dealers`);
      else history.push('/dashboard');
      resetOrder();
    }
  };

  const getInventoryProducts = inventory => {
    var map = inventory.reduce(function(prev, cur) {
      prev[cur] = (prev[cur] || 0) + 1;
      return prev;
    }, {});

    const items = [];

    for (const key of Object.keys(map)) {
      items.push(
        <ProductBox
          item={key}
          key={key}
          orderType={orderType}
          quantity={map[key]}
          setPrice={getTotalPrice}
        />
      );
    }
    return items;
  };

  const getDirectProducts = ship => {
    let p = ship.map((item, index) => {
      return (
        <ProductBox
          item={item}
          key={index}
          orderType={orderType}
          setPrice={getTotalPrice}
        />
      );
    });
    return p;
  };

  /******* final Submit Order ******/
  const onSubmitOrder = async () => {
    if (selectedCard.length === 0) {
      notification('Warning', 'Please select a card', 'warning');
      return;
    } else if (
      shippinginfor === 1 &&
      employeeFirstName === '' &&
      employeeLastName === ''
    ) {
      notification(
        'Warning',
        'Please input the company owner/employee information',
        'warning'
      );
      return;
    } else if (orderType === 1 && ship.length === 0) {
      notification('Warning', 'Please select one more product', 'warning');
      return;
    } else if (orderType === 0 && inventory.length === 0) {
      notification('Warning', 'Please select one more product', 'warning');
      return;
    }

    let data = {};

    data.card = selectedCard;
    data.mohawk_account = accountData.vacuumAccount
      ? ''
      : accountData.mohawkAccount;
    data.vacuumAccount = accountData.vacuumAccount
      ? accountData.vacuumAccount
      : '';
    data.selectedUsers = selectedUsers;
    data.order = {};
    data.amount = totalPrice;
    data.discount = selectedCard === 'freepaid' ? totalPrice : discount;
    data.order.cust_company = accountData.mainstore.name;
    data.order.cust_first_name = accountData.firstName;
    data.order.cust_last_name = accountData.lastName;
    data.order.cust_address_1 = accountData.mainstore.address1;
    data.order.cust_address_2 = accountData.mainstore.address2;
    data.order.cust_city = accountData.mainstore.city;
    data.order.cust_state = accountData.mainstore.us_state;
    data.order.cust_zip = accountData.mainstore.zipcode;
    data.order.cust_phone = accountData.mainstore.phoneNumber;
    data.order.cust_e_mail = accountData.email;
    data.order.credit_card_no = selectedCard.cardnumber;

    if (orderType === 1 || orderType === 3 || orderType === 2) {
      let type =
        orderType === 1
          ? shippinginfor === 0
            ? '.DS'
            : '.DSS'
          : orderType === 2
          ? '.MKT'
          : '.DEM';
      data.order.cust_ref =
        'Test_' +
        Math.random()
          .toString(36)
          .substring(7) +
        type;

      if (shippinginfor === 0) {
        data.order.ship_first_name = customerInformation.firstName;
        data.order.ship_last_name = customerInformation.lastName;
        // data.order.ship_company = customerInformation.email
        data.order.ship_address_1 = customerInformation.address1;
        data.order.ship_address_2 = customerInformation.address2;
        data.order.ship_phone = customerInformation.phoneNumber;
        data.order.ship_city = customerInformation.city;
        data.order.ship_state = customerInformation.us_state;
        data.order.ship_zip = customerInformation.zipcode;
        data.order.ship_e_mail = customerInformation.email;
      } else {
        let store = storesData.filter(item => item._id === selectedStore);
        data.order.ship_first_name = employeeFirstName;
        data.order.ship_last_name = employeeLastName;
        data.order.ship_company = store[0].name;
        data.order.ship_phone = store[0].phoneNumber;
        data.order.ship_address_1 = store[0].address1;
        data.order.ship_address_2 = store[0].address2;
        data.order.ship_city = store[0].city;
        data.order.ship_state = store[0].us_state;
        data.order.ship_zip = store[0].zipcode;
        data.order.ship_e_mail = accountData.email;
      }

      if (orderType === 2) {
        data.order.items = ship.map(item => {
          let p = {};
          p.item = item;
          p.quantity = 1;
          let result = Contants.MKTKarastanProducts.filter(
            product => product._id === item
          );
          p.name = result[0].name;
          p.model = result[0].description;
          p.price = parseFloat(result[0].price / 100);
          p.imageurl = result[0].imageurl;
          p.discount = 0;
          p.sub_total = parseFloat(result[0].price / 100);
          return p;
        });
      } else if (orderType === 3) {
        data.order.items = ship.map(item => {
          let p = {};
          p.item = item;
          p.quantity = 1;
          let result = Contants.DemoProducts.filter(
            product => product._id === item
          );
          p.name = result[0].name;
          p.model = result[0].description;
          p.price = parseFloat(result[0].price / 100);
          p.imageurl = result[0].imageurl;
          p.discount = 0;
          p.sub_total = parseFloat(result[0].price / 100);
          return p;
        });
      } else {
        data.order.items = ship.map(item => {
          let p = {};
          p.item = item;
          p.quantity = 1;
          let result = Contants.DirectShipKarastanProducts.filter(
            product => product._id === item
          );
          p.name = result[0].name;
          p.model = result[0].description;
          p.price = parseFloat(result[0].price / 100);
          p.imageurl = result[0].imageurl;
          p.discount = 0;
          p.sub_total = parseFloat(result[0].price / 100);
          return p;
        });
      }
    } else if (orderType === 0) {
      data.order.cust_ref =
        Math.random()
          .toString(36)
          .substring(7) + '.INV';

      let store = storesData.filter(item => item._id === selectedStore);

      data.order.ship_first_name = employeeFirstName;
      data.order.ship_last_name = employeeLastName;
      data.order.ship_company = store[0].name;
      data.order.ship_phone = store[0].phoneNumber;
      data.order.ship_address_1 = store[0].address1;
      data.order.ship_address_2 = store[0].address2;
      data.order.ship_city = store[0].city;
      data.order.ship_state = store[0].us_state;
      data.order.ship_zip = store[0].zipcode;
      data.order.ship_e_mail = accountData.email;
      data.order.PO_number = POnumber;

      var map = inventory.reduce(function(prev, cur) {
        prev[cur] = (prev[cur] || 0) + 1;
        return prev;
      }, {});

      data.order.items = [];

      for (const key of Object.keys(map)) {
        let p = {};
        p.item = key;
        let result = accountData.vacuumAccount
          ? Contants.InventoryVacuumProducts.filter(
              product => product._id === key
            )
          : Contants.InventoryKarastanProducts.filter(
              product => product._id === key
            );
        p.name = result[0].name;
        p.model = result[0].description;
        p.quantity = map[key] * result[0].multiples;
        if (p.quantity >= 10) {
          p.price = parseFloat(result[0].discount / 100);
        } else {
          p.price = parseFloat(result[0].price / 100);
        }
        p.imageurl = result[0].imageurl;
        p.discount = 0;
        p.sub_total = Number(p.price) * Number(p.quantity);
        data.order.items.push(p);
      }
    }

    submitOrder(
      data,
      isDealer(user.roles) ||
        isVacuumDealer(user.roles) ||
        isOfficial(user.roles) ||
        isManager(user.roles)
        ? accountData._id
        : accountData._adminId
    );
  };

  return (
    <div className="text-center mx-auto Payment">
      <Row className="justify-content-center mt-2">
        <Col md="12" lg="10">
          <Row>
            <Col xs="12" md="7" className="text-left">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="font-weight-normal text-black">
                  Payment Method
                </h3>
                <AddPaymentMethodModal
                  toggleModal={toggleModal}
                  customerId={'1'}
                  id={
                    accountData.roles === 'employee'
                      ? accountData._adminId
                      : accountData._id
                  }
                />
              </div>
              {isPending(cardLoadingState) ? (
                <LoadingIndicator />
              ) : (
                <>
                  {cardsData.map((item, index) => {
                    return (
                      <PaymentMethod
                        data={item}
                        key={index}
                        selectPayment={onSelectCard}
                        selectedIndex={selectedCard}
                      />
                    );
                  })}
                  {isAdmin(user.roles) ? (
                    <MohawkPaymentMethod
                      selectedIndex={selectedCard}
                      selectPayment={onSelectCard}
                    />
                  ) : null}
                  {/* : parseFloat(totalPrice) >= 2150 && orderType === 0 ? (
                    <MohawkPaymentMethod
                      selectedIndex={selectedCard}
                      selectPayment={onSelectCard}
                    />
                  )  */}
                  {isAdmin(user.roles) ? (
                    <FreePaidMethod
                      selectedIndex={selectedCard}
                      selectPayment={onSelectCard}
                    />
                  ) : null}
                </>
              )}

              <hr />
              <PaymentShipping SW={props.previousStep} />
              <hr />
              {accountData.vacuumAccount ? (
                <>
                  <h3 className="mb-3" style={{ fontWeight: '400' }}>
                    Enter PO Number
                  </h3>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Enter PO Number"
                      type="text"
                      value={POnumber}
                      onChange={e => setPOnumber(e.target.value)}
                    />
                  </div>
                </>
              ) : null}

              <EmailNotification />
            </Col>
            <Col xs="12" md="5">
              <Card className="card-accent-primary mt-mobile-5 ">
                <CardHeader>
                  <h4 className="font-weight-normal text-black">
                    Order Summary
                  </h4>
                </CardHeader>
                <CardBody>
                  {orderType === 0
                    ? inventory && getInventoryProducts(inventory)
                    : orderType === 1 || orderType === 3 || orderType === 2
                    ? ship && getDirectProducts(ship)
                    : null}
                  {isAdmin(user.roles) && selectedCard !== 'freepaid' && (
                    <>
                      <Discount totalPrice={totalPrice} />
                      <hr />
                    </>
                  )}

                  <ProductInfo
                    onSubmitOrder={onSubmitOrder}
                    products={orderType === 0 ? inventory : ship}
                    state={state}
                    onResetOrder={onResetOrder}
                    totalPrice={totalPrice}
                    discount={
                      selectedCard !== 'freepaid' ? discount : totalPrice
                    }
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <Stats step={4} {...props} />
    </div>
  );
};

const mapStateToProps = ({ salesform, card, stores, account, auth }) => {
  const {
    orderType,
    selectedCard,
    ship,
    employeeFirstName,
    employeeLastName,
    selectedUsers,
    selectedStore,
    state,
    shippinginfor,
    inventory,
    customerInformation,
    orderResponseData,
    discount,
  } = salesform;
  const cardLoadingState = card['state'];
  const { cardsData } = card;
  const { storesData } = stores;
  const { accountData } = account;
  const { user } = auth;
  return {
    orderType,
    discount,
    selectedCard,
    cardsData,
    ship,
    employeeFirstName,
    employeeLastName,
    selectedUsers,
    selectedStore,
    storesData,
    state,
    shippinginfor,
    inventory,
    customerInformation,
    accountData,
    cardLoadingState,
    user,
    orderResponseData,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCards: id => {
      dispatch(fetchCards(id));
    },
    selectCard: card => {
      dispatch(onSelectCard(card));
    },
    submitOrder: (data, id) => {
      dispatch(onSubmitOrder(data, id));
    },
    resetOrder: () => {
      dispatch(submitOrderReset());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Payment);
