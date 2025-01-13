import React, { useState, useEffect, createRef } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import OrderTypeItem from '../OrderTypeItem';
import InformationForm from '../InformationForm';
import LocationForm from '../LocationForm';
import Stats from '../Stats';

import {
  selectShippingInfor,
  onSelectStoreLocation,
  onSetCustomerInfo,
} from '../../../../reducers/salesForm';
import { fetchStores } from '../../../../reducers/Stores';
import * as Constants from '../../../../_config/constants';

import './ShippingInformation.scss';

const ShippingInformation = ({
  orderType,
  onSelectShippingInfor,
  fetchStores,
  storesData,
  onSelectStore,
  selectedStore,
  shippinginfor,
  setCustomerInformation,
  customerInformation,
  state,
  accountData,
  ...props
}) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [customerData, setCustomerData] = useState();
  const form = createRef();

  useEffect(() => {
    setSelectedIndex(shippinginfor);
    setCustomerData(customerInformation);
  }, []);

  const onSelected = index => {
    setSelectedIndex(index);
    onSelectShippingInfor(index);
  };

  useEffect(() => {
    if (accountData.roles === 'employee') {
      fetchStores(accountData._adminId);
    } else if (
      accountData.roles === 'dealer' ||
      accountData.roles === 'vacuum-dealer'
    ) {
      fetchStores(accountData._id);
    }
  }, []);

  const handleClick = (...args) => {
    if (shippinginfor === 0) {
      form.current.handleSubmit(...args);
    } else {
      props.nextStep();
    }
  };

  const onSubmit = values => {
    if (
      values.firstName !== '' &&
      values.lastName !== '' &&
      values.email !== '' &&
      values.phoneNumber !== '' &&
      values.address1 !== '' &&
      values.city !== '' &&
      values.zipcode !== ''
    ) {
      setCustomerInformation(values);
      props.nextStep();
    }
  };

  return (
    <div className="text-center ShippingInformation mx-auto ">
      <Row className="align-items-center mt-4">
        <Col>
          <h2 className="font-weight-bold text-black">
            {' '}
            Shipping Information{' '}
          </h2>
        </Col>
      </Row>
      {orderType === 1 ? (
        <>
          <Row className="justify-content-center mt-2">
            <Col lg="8" sm="12">
              <Row className="justify-content-around">
                {Constants.shippinginforType.map((item, index) => {
                  return (
                    <Col xs="12" sm="4" md="5" className="mt-3" key={index}>
                      <OrderTypeItem
                        info={item}
                        type={index}
                        selectedIndex={selectedIndex}
                        onSelected={onSelected}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Col>
          </Row>

          <Row className="justify-content-center mt-2">
            <Col lg="8" sm="12">
              <Row>
                <Col xs="12">
                  {selectedIndex === 0 ? (
                    <InformationForm
                      ref={form}
                      submitValue={onSubmit}
                      initialValues={customerData}
                    />
                  ) : selectedIndex === 1 ? (
                    <LocationForm
                      data={storesData}
                      onSelectStore={onSelectStore}
                      storeLoading={state}
                      selectedStore={selectedStore}
                      id={
                        accountData.roles === 'employee'
                          ? accountData._adminId
                          : accountData._id
                      }
                    />
                  ) : null}
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      ) : (
        <Row className="justify-content-center mt-2">
          <Col lg="8" sm="12">
            <Row>
              <Col xs="12">
                <LocationForm
                  data={storesData}
                  onSelectStore={onSelectStore}
                  storeLoading={state}
                  selectedStore={selectedStore}
                  id={
                    accountData.roles === 'employee'
                      ? accountData._adminId
                      : accountData._id
                  }
                />
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      <Stats
        step={3}
        {...props}
        activeNextStep={shippinginfor === 1 ? !selectedStore : null}
        nextStep={handleClick}
      />
    </div>
  );
};

const mapStateToProps = ({ salesform, stores, account }) => {
  const {
    orderType,
    selectedStore,
    shippinginfor,
    customerInformation,
  } = salesform;
  const { storesData, state } = stores;
  const { accountData } = account;
  return {
    orderType,
    storesData,
    selectedStore,
    shippinginfor,
    customerInformation,
    state,
    accountData,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectShippingInfor: orderType => {
      dispatch(selectShippingInfor(orderType));
    },
    onSelectStore: store => {
      dispatch(onSelectStoreLocation(store));
    },
    fetchStores: id => {
      dispatch(fetchStores(id));
    },
    setCustomerInformation: value => {
      dispatch(onSetCustomerInfo(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShippingInformation);
