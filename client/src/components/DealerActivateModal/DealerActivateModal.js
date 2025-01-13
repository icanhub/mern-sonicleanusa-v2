import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import RegisterForm from '../../views/Pages/Register/RegisterForm';
import { dealerActivationRequest } from '../../reducers/official';

const DealerActivateModal = ({ data, dealerActivation }) => {
  const [modal, setModal] = useState(false);
  const [initialdata, setInitialData] = useState();

  useEffect(() => {
    let initData = {};

    initData.firstName = data.firstName;
    initData.lastName = data.lastName;
    initData.email = data.email;
    initData.companyName = data.companyName;
    initData.phoneNumber = data.phoneNumber;
    initData.websiteURL = data.websiteURL;
    initData.mohawkAccount = data.mohawkAccount;
    initData.mohawkBrand = data.mohawkBrand;
    initData.address1 = data.stores[0].address1;
    initData.address2 = data.stores[0].address2;
    initData.city = data.stores[0].city;
    initData.us_state = data.stores[0].us_state;
    initData.zipcode = data.stores[0].zipcode;

    setInitialData(initData);
  }, []);

  const onSubmit = values => {
    dealerActivation(data.stores[0]._id, data._id, values);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="btn-success mr-1"
        onClick={() => setModal(true)}
      >
        Activate
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-lg'}>
        <ModalHeader toggle={() => setModal(false)}>
          {data.firstName} {data.lastName}
        </ModalHeader>
        <ModalBody>
          <RegisterForm submit={onSubmit} initialData={initialdata} />
        </ModalBody>
      </Modal>
    </>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    dealerActivation: (storeId, dealerId, data) => {
      dispatch(dealerActivationRequest(storeId, dealerId, data));
    },
  };
};

export default withRouter(
  connect(null, mapDispatchToProps)(DealerActivateModal)
);
