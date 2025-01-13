import React from 'react';
import classNames from 'classnames';
import { Card, Row, Col, CardBody } from 'reactstrap';
import { AppSwitch } from '@coreui/react';

import './FreePaidMethod.scss';

const FreePaidMethod = ({ selectPayment, selectedIndex }) => {
  const onSelect = () => {
    selectPayment('freepaid');
  };

  return (
    <div className="FreePaidMethod mt-2">
      <Card className="border-info" onClick={onSelect}>
        <CardBody
          className={classNames(
            'FreePaidMethod__card align-items-center text-black ',
            selectedIndex === 'freepaid' ? 'FreePaidMethod__selected' : ''
          )}
        >
          <Row className="align-items-center">
            <Col sm={12} md={6}>
              <h5 className="font-weight-normal font-weight-normal">
                No Charge (FREE)
              </h5>
            </Col>
            <Col sm={12} md={6} className="text-md-center text-sm-left">
              <AppSwitch
                className={'mx-1 mt-2'}
                color={'success'}
                checked={selectedIndex === 'freepaid'}
                disabled
                label
                dataOn={'selected'}
                dataOff={'select'}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default FreePaidMethod;
