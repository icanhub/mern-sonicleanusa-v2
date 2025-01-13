import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import AddPaymentMethodModal from '../../../../components/AddPaymentMethodModal/AddPaymentMethodModal';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import { fetchCards, deleteCardRequest } from '../../../../reducers/cards';

import Visa from '../../images/visa.png';
import Mastercard from '../../images/Mastercard.png';
import AMEX from '../../images/AMEX.jpg';
import Discover from '../../images/discover.jpg';
import Diners from '../../images/Diners.jpg';
import JCB from '../../images/jcb.png';
import VisaElectron from '../../images/visaelectron.png';
import { isPending } from '../../../../utils/state';

import './PaymentMethods.scss';

const PaymentMethods = () => {
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  const fetching_state = useSelector(state => state.card.fetching_state);
  const deleting_state = useSelector(state => state.card.deleting_state);
  const cardsData = useSelector(state => state.card.cardsData);
  const accountData = useSelector(state => state.account.accountData);

  useEffect(() => {
    if (accountData.roles === 'employee') {
      dispatch(fetchCards(accountData._adminId));
    } else if (
      accountData.roles === 'dealer' ||
      accountData.roles === 'vacuum-dealer'
    ) {
      dispatch(fetchCards(accountData._id));
    }
  }, []);

  const toggleModal = () => {
    setModal(!modal);
  };

  const deleteCard = (id, dealer) => {
    dispatch(deleteCardRequest(id, dealer));
  };

  const getCardType = param => {
    let cardtypeImg = '';
    switch (param) {
      case 'visa':
        cardtypeImg = Visa;
        break;
      case 'Visa':
        cardtypeImg = Visa;
        break;
      case 'mastercard':
        cardtypeImg = Mastercard;
        break;
      case 'amex':
        cardtypeImg = AMEX;
        break;
      case 'discover':
        cardtypeImg = Discover;
        break;
      case 'diners':
        cardtypeImg = Diners;
        break;
      case 'Diners - Carte Blanche':
        cardtypeImg = Diners;
        break;
      case 'jcb':
        cardtypeImg = JCB;
        break;
      case 'Visa Electron':
        cardtypeImg = VisaElectron;
        break;
      default:
        return;
    }
    return cardtypeImg;
  };

  return (
    <div className="PaymentMethods mt-4">
      <Row>
        <Col xs="12">
          {isPending(fetching_state) ? (
            <LoadingIndicator />
          ) : (
            <Table responsive className="table-hover ">
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Card Number</th>
                  <th>Exp. Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {cardsData &&
                  cardsData.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <img src={getCardType(item.cardtype)} alt="visa" />
                        </td>
                        <td>•••• {item.cardnumber}</td>
                        <td>{item.expdate}</td>
                        <td className="text-right">
                          <ConfirmationModal
                            state={deleting_state}
                            text="Delete"
                            size="md"
                            color="danger"
                            header="Activation"
                            onClickFunc={() =>
                              deleteCard(
                                item._id,
                                accountData.roles === 'employee'
                                  ? accountData._adminId
                                  : accountData._id
                              )
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <AddPaymentMethodModal
            toggleModal={toggleModal}
            customerId={'1'}
            id={
              accountData.roles === 'employee'
                ? accountData._adminId
                : accountData._id
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default PaymentMethods;
