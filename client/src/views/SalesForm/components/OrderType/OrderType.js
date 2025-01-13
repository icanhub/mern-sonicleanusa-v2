import React, { Component } from 'react';
import { connect } from 'react-redux';
import Stats from '../Stats';
import OrderTypeItem from '../OrderTypeItem';
import ReferralModal from '../ReferralModal';

import {
  selectOrderType,
  selectShippingInfor,
  clearSelectedProdcuts,
} from '../../../../reducers/salesForm';
import * as Constants from '../../../../_config/constants';
import './OrderType.scss';

import { Button, Col, Row } from 'reactstrap';
import {
  isAdmin,
  isVacuumDealer,
  isEmployee,
  isDealer,
  isWorker,
} from '../../../../_helpers/helper';

class OrderType extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOrderType: null,
      modal: false,
    };
  }

  componentDidMount = () => {
    this.setState({ selectedOrderType: this.props.orderType });
  };

  onSelected = (type, selected) => {
    this.setState({ selectedOrderType: type });
    this.props.onClearSelectedProdcuts();
    this.props.onSelectOrderType(type);
    if (type === 0 || type === 3 || type === 2) {
      this.props.onSelectShippingInfor(1);
    } else {
      this.props.onSelectShippingInfor(-1);
    }
  };

  toggleModal = () => {
    if (this.state.modal) {
      this.setState({ selectedOrderType: -1 });
      this.props.onSelectOrderType(-1);
    }
    this.setState({ modal: !this.state.modal });
  };

  render() {
    const { modal } = this.state;
    const { orderType, selectedIndex } = this.props;

    return (
      <div className="text-center OrderType">
        <ReferralModal toogle={modal} closeModal={this.toggleModal} />
        <Row className="mt-4">
          <Col>
            <h2 className="font-weight-bold">Please Select Order Type</h2>
          </Col>
        </Row>
        <Row className="justify-content-center mt-5">
          {Constants.orderType.map((item, index) => {
            if (
              isVacuumDealer(this.props.user.roles) &&
              (index === 1 || index === 2 || index === 3)
            )
              return '';
            else if (isDealer(this.props.user.roles) && index === 3) return '';
            else if (isEmployee(this.props.user.roles)) {
              if (
                this.props.user.vacuumAccount &&
                (index === 1 || index === 2 || index === 3)
              ) {
                return '';
              } else if (index === 3) {
                return '';
              }
            }
            return (
              <Col
                md="3"
                lg={isAdmin(this.props.user.roles) ? '2' : '3'}
                className="mt-3"
                key={index}
              >
                <OrderTypeItem
                  info={item}
                  selectedIndex={orderType}
                  type={index}
                  onSelected={this.onSelected}
                />
              </Col>
            );
          })}
        </Row>
        <Row>
          <Col>
            {orderType === 4 ? (
              <Button color="primary mt-5" onClick={this.toggleModal}>
                Continue
              </Button>
            ) : (
              <Stats
                step={1}
                {...this.props}
                activeNextStep={
                  selectedIndex === null ||
                  selectedIndex === '' ||
                  orderType === -1
                }
              />
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

OrderType.propTypes = {};

const mapStateToProps = ({ salesform, auth }) => {
  const { orderType } = salesform;
  const { user } = auth;
  return { orderType, user };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectOrderType: orderType => {
      dispatch(selectOrderType(orderType));
    },
    onSelectShippingInfor: type => {
      dispatch(selectShippingInfor(type));
    },
    onClearSelectedProdcuts: () => {
      dispatch(clearSelectedProdcuts());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderType);
