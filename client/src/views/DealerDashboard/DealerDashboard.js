import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SalesChart from '../../components/SalesChart';
import AmountChart from '../../components/AmountChart';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { fetchOrderHistoryList } from '../../reducers/OrderHistory';
import { isPending } from '../../utils/state';

import { logout, updateNewPrice } from '../../reducers/auth';
import { isDealer, isEmployee, isVacuumDealer } from '../../_helpers/helper';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { connect } from 'react-redux';
import { fetchManagerUploadFile } from '../../reducers/manager';
import { getMangerUploadFile } from '../../_helpers/helper';
import Vacuum_PDF from '../../view/Privacy-Vacuum-20210601.pdf';
//import Mohawk_PDF from '../view/Mohawk-programDetail-file.pdf';

const DealerDashboard = ({ history, pdf_file, getUploadFile }) => {
  const state = useSelector(state => state.orderhistory.state);
  const user = useSelector(state => state.auth.user);
  const orderhistorylist = useSelector(
    state => state.orderhistory.orderhistorylist
  );

  const [modal, setModal] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const dispatch = useDispatch();

  const closePriceUpdateModal = () => {
    dispatch(logout());
    setModal(false);
  };

  useEffect(() => {
    if (agreed) {
      setModal(false);
    }
  }, [agreed]);

  const [pdf, setPdf] = useState(null);
  useEffect(() => {
    (async () => {
      // await getUploadFile();
      if (isDealer(user.roles)) {
        await getUploadFile();
        dispatch(fetchOrderHistoryList(user.mohawkAccount));
      } else if (isEmployee(user.roles)) {
        dispatch(fetchOrderHistoryList(user.mohawkAccount));
      }
      // setPdf(Mohawk_PDF);
    })();
  }, []);

  // useEffect(() => {
  //   if (pdf_file && pdf_file.uploadfile) {
  //     const temp = require(`../../../../public/manager/${pdf_file.uploadfile}`);
  //     setPdf(temp);
  //   }
  // }, [pdf_file && pdf_file.uploadfile]);

  return (
    <div className="animated fadeIn dashboard">
      {modal &&
      (user.roles === 'dealer' || user.roles === 'vacuum-dealer') &&
      !user.newPriceAccepted ? (
        <Modal isOpen={modal} className={'modal-primary modal-lg'}>
          <ModalHeader toggle={closePriceUpdateModal}>
            {user.roles === 'dealer'
              ? 'Program Update – December 15 2024'
              : 'Program Update – December 15 2024'}
          </ModalHeader>
          <ModalBody>
            <Row className="mb-3">
              <Col>
                {isVacuumDealer(user.roles) ? (
                  <h5 className="modal-text-color">
                    To view the latest program update, click the link below:{' '}
                    {Vacuum_PDF ? (
                      <a href={Vacuum_PDF || ''} target="_blank">
                        Download
                      </a>
                    ) : (
                      <LoadingIndicator />
                    )}
                  </h5>
                ) : (
                  <h5 className="modal-text-color">
                    To view the latest program update, click the link below:{' '}
                    {pdf_file.uploadfile !== undefined ? (
                      <a
                        href={getMangerUploadFile(pdf_file.uploadfile) || ''}
                        target="_blank"
                      >
                        Download
                      </a>
                    ) : (
                      <LoadingIndicator />
                    )}
                  </h5>
                )}
                <br />
                <button
                  style={{
                    color: 'white',
                    backgroundColor: '#20a8d8',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '15px',
                    padding: '5px 10px',
                  }}
                  onClick={() => {
                    dispatch(updateNewPrice(user.id));
                    setAgreed(true);
                  }}
                >
                  I agree
                </button>
                <p>
                  By clicking on 'I agree' you are agreeing to the latest
                  program details. <br />
                  Closing this consent will log you out.
                </p>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      ) : null}

      {isPending(state) ? (
        <LoadingIndicator />
      ) : (
        <>
          <Row>
            <Col>
              <h1>Hi, {user.firstName}</h1>
              <h3 className="mt-1">What would you like to do?</h3>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col xs="12" sm="6" lg="4">
              <Card
                className="text-white bg-primary text-center dashboard__card"
                onClick={() => history.push(`/sales/${user.id}`)}
              >
                <CardBody>
                  <h4>Place an Order</h4>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="6" lg="4">
              <Card
                className="text-white bg-success text-center dashboard__card"
                onClick={() => history.push('/programdetails')}
              >
                <CardBody>
                  <h4>View Program Details</h4>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="6" lg="4">
              <Card
                className="text-white bg-danger text-center dashboard__card"
                onClick={() => history.push('/contact-us')}
              >
                <CardBody>
                  <h4>Contact Soniclean</h4>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <SalesChart orderhistory={orderhistorylist} />
          <AmountChart orderhistory={orderhistorylist} />
        </>
      )}
    </div>
  );
};

const mapStateToProps = ({ manager }) => {
  const { pdf_file, state } = manager;
  return { pdf_file, state };
};

const mapDispatchToProps = dispatch => {
  return {
    getUploadFile: () => {
      dispatch(fetchManagerUploadFile());
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DealerDashboard)
);
