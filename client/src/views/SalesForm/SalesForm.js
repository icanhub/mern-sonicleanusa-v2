import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import StepWizard from 'react-step-wizard';
import OrderType from './components/OrderType';
import SelectProduct from './components/SelectProduct';
import ShippingInformation from './components/ShippingInformation';
import Payment from './components/Payment';
import Nav from './components/Nav';
import { fetchAccountData } from '../../reducers/account';
import { submitOrderReset } from '../../reducers/salesForm'
import { Card, CardBody, CardHeader } from 'reactstrap';

import './SalesForm.scss';

const SalesForm = ({ match, fetchAccount, resetOrder, ...props }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [instance, setIns] = useState();

  useEffect(() => {
    fetchAccount(match.params.id);
    resetOrder()
  }, []);

  const onStepChange = stats => {
    setActiveStep(stats.activeStep);
  };

  const setInstance = SW => setIns(SW);

  return (
    <div className="SalesForm animated fadeIn">
      <Card>
        <CardHeader>
          <Nav activeStep={activeStep} />
        </CardHeader>
        <CardBody>
          <StepWizard
            instance={setInstance}
            onStepChange={onStepChange}
            isHashEnabled
            isLazyMount={true}
          >
            <OrderType hashKey={'ordertype'} {...props} />
            <SelectProduct hashKey={'selectproduct'} />
            <ShippingInformation hashKey={'shippinginformation'} />
            <Payment hashKey={'payment'} />
          </StepWizard>
        </CardBody>
      </Card>
    </div>
  );
};

const mapStateToProps = ({ account }) => {
  const { accountData } = account;
  return { accountData };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAccount: id => {
      dispatch(fetchAccountData(id));
    },
    resetOrder: () => {
      dispatch(submitOrderReset());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SalesForm);
