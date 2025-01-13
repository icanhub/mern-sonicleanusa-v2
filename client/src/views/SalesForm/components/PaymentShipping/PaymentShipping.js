import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, FormFeedback, Row, Col } from 'reactstrap';
import { Input } from 'reactstrap';
import {
  onSetEmployeeFirstName,
  onSetEmployeeLastName,
} from '../../../../reducers/salesForm';

const PaymentShipping = ({
  type,
  storesData,
  selectedStore,
  shippinginfor,
  setEmployeeFirstName,
  setEmployeeLastName,
  employeeFirstName,
  employeeLastName,
  customerInformation,
  ...props
}) => {
  const [requireName, setRequireName] = useState(false);
  const [store, setStore] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    let result = storesData.filter(item => item._id === selectedStore);
    setStore(result[0]);
  }, [selectedStore]);

  const handleFirstChange = e => {
    setFirstName(e.target.value);
    setEmployeeFirstName(e.target.value);
  };

  const handleLastChange = e => {
    setLastName(e.target.value);
    setEmployeeLastName(e.target.value);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="font-weight-normal text-black">
          {shippinginfor === 1
            ? 'Store Shipping Information'
            : 'Customer Shipping Information'}
        </h3>
      </div>
      {shippinginfor === 1 && (
        <div>
          <h6 className="text-black font-weight-normal">
            Enter name of company owner/employee that this order will be
            addressed to
          </h6>
          <Row>
            <Col>
              <Input
                onChange={handleFirstChange}
                // onBlur={handleBlur}
                className="mt-2"
                value={employeeFirstName}
                placeholder="First Name"
                invalid={requireName}
              />
            </Col>
            <Col>
              <Input
                onChange={handleLastChange}
                // onBlur={handleBlur}
                className="mt-2"
                value={employeeLastName}
                placeholder="Last Name"
                invalid={requireName}
              />
            </Col>
          </Row>
          <FormFeedback>Employee Name is required</FormFeedback>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-2">
        {shippinginfor === 1 ? (
          <div>
            <h6 className=".text-muted font-weight-normal pr-5">
              {store.name}
            </h6>
            <h6 className=".text-muted font-weight-normal pr-5">
              {store.address1}
            </h6>
            <h6 className=".text-muted font-weight-normal pr-5">
              {store.address2}
            </h6>
            <h6 className=".text-muted font-weight-normal pr-5">
              {store.city}, {store.us_state}, {store.zipcode}
            </h6>
          </div>
        ) : (
          <div>
            <h6 className=".text-muted font-weight-normal pr-5">
              {customerInformation.firstName} {customerInformation.lastName}
            </h6>
            <h6 className=".text-muted font-weight-normal pr-5">
              {customerInformation.address1}
            </h6>
            <h6 className=".text-muted font-weight-normal pr-5">
              {customerInformation.address2}
            </h6>
            <h6 className=".text-muted font-weight-normal pr-5">
              {customerInformation.city}, {customerInformation.us_state},{' '}
              {customerInformation.zipcode}
            </h6>
          </div>
        )}
        <Button color="info" onClick={props.SW}>
          <i className="fa fa-edit"></i> &nbsp; Edit
        </Button>
      </div>
    </>
  );
};

const mapStateToProps = ({ salesform, stores }) => {
  const {
    shippinginfor,
    selectedStore,
    employeeFirstName,
    employeeLastName,
    customerInformation,
  } = salesform;
  const { storesData } = stores;
  return {
    shippinginfor,
    selectedStore,
    storesData,
    employeeFirstName,
    employeeLastName,
    customerInformation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setEmployeeFirstName: name => {
      dispatch(onSetEmployeeFirstName(name));
    },
    setEmployeeLastName: name => {
      dispatch(onSetEmployeeLastName(name));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PaymentShipping);
