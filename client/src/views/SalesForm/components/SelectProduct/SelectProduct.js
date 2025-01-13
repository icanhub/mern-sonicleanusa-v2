import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import parse from 'html-react-parser';
import Stats from '../Stats';
import ProductCard from '../ProductCard';
import * as Contants from '../../../../_config/constants';
import {
  selectInventory,
  selectShip,
  selectVacuumQuantity,
  selectVacuumTotal,
} from '../../../../reducers/salesForm';
import { special_accounts, special_products } from '../../../../_config/constants';

import './SelectProduct.scss';
import { isAdmin } from '../../../../_helpers/helper';

class SelectProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDirectShipIndex: [],
      inventoryIndex: [],
      shipIndex: [],
      vacuumCount: 0,
      minimumVacuumTotal: 0,
    };
  }

  onVacuumChange = (sign, count) => {
    let temp = this.state;
    if (sign == '+') temp['vacuumCount'] = this.state.vacuumCount + count;
    if (sign == '-') temp['vacuumCount'] = this.state.vacuumCount - count;
    this.setState(temp);
  };

  onVacuumAmountChange = (sign, price) => {
    let temp = this.state;
    if (sign == '+')
      temp['minimumVacuumTotal'] = this.state.minimumVacuumTotal + price;
    if (sign == '-')
      temp['minimumVacuumTotal'] = this.state.minimumVacuumTotal - price;
    this.setState(temp);
  };

  componentWillMount = () => {
    this.setState({
      inventoryIndex: this.props.inventory,
      inventoryVacuum: this.props.inventory,
      shipIndex: this.props.ship,
    });
  };

  componentDidMount = () => {
    this.setState({
      vacuumCount: this.props.vacuumQuantity,
      minimumVacuumTotal: this.props.vacuumTotal,
    });
  };

  onSelectProduct = (selectedIndex, counts, clickType) => {
    const { orderType } = this.props;
    if (orderType === 1 || orderType === 3 || orderType === 2) {
      if (clickType === true) {
        let shipIndex = this.props.ship;
        shipIndex.push(selectedIndex);
        this.props.onSelectShip(shipIndex);
        this.setState({ shipIndex: shipIndex });
      } else {
        let shipIndex = this.props.ship;
        var index = shipIndex.indexOf(selectedIndex);
        if (index !== -1) shipIndex.splice(index, 1);
        this.props.onSelectShip(shipIndex);
        this.setState({ shipIndex: shipIndex });
      }
    } else if (orderType === 0) {
      if (clickType === 'plus') {
        let inventoryIndex = this.props.inventory;
        inventoryIndex.push(selectedIndex);
        this.props.onSelectInventory(inventoryIndex);
        this.setState({ inventoryIndex: inventoryIndex });
      } else {
        let inventoryIndex = this.props.inventory;
        index = inventoryIndex.lastIndexOf(selectedIndex);
        if (index !== -1) inventoryIndex.splice(index, 1);
        this.props.onSelectInventory(inventoryIndex);
        this.setState({ inventoryIndex: inventoryIndex });
      }
    }
  };

  _renderTopContent = orderType => {
    return (
      <>
        <Row className="align-items-center mt-4">
          <Col>
            <h2 className="font-weight-bold text-black">
              {Contants.orderType[orderType] &&
                Contants.orderType[orderType].title}
            </h2>
          </Col>
        </Row>
        <Row className="justify-content-center mt-2">
          {!(this.props.accountData && this.props.accountData.mohawkBrand) &&
          !isAdmin(this.props.user.roles) ? (
            <Col lg="9" sm="12">
              <h5 className="font-weight-normal">
                This form allows you to order inventory for your store. Vacuums
                are sold in multiples of 2 and accessories are sold by the case;
                one case contains 4 packages of accessories. All prices include
                freight for orders with shipping addresses within the contiguous
                US.{' '}
                <span style={{ color: 'red' }}>
                  Minimum Order Quantity for vacuums is 4 units per order and
                  the Minimum order amount is $1000.
                </span>{' '}
                For more pricing and shipping information, please reference{' '}
                <a href="/programdetails">Sonicleans Dealer Sell Sheet</a>
              </h5>
            </Col>
          ) : (
            <Col lg="9" sm="12">
              <h5 className="font-weight-normal">
                {Contants.orderType[orderType] &&
                  parse(Contants.orderType[orderType].detail)}
              </h5>
            </Col>
          )}
        </Row>
      </>
    );
  };

  checkingSpecialCase = item => {
    for (var i = 0; i < special_accounts.length; i++) {
      if (
        special_accounts[i].account ===
        this.props.accountData.mohawkAccount.toString()
      ) {
        if (special_accounts[i].products.indexOf(item._id) > -1) {
          return special_products[
            special_accounts[i].products.indexOf(item._id)
          ];
        }
      } else {
        return item;
      }
    }
  };

  _renderDirectShipProducts = () => {
    return this.props.accountData.mohawkBrand === 'Karastan'
      ? Contants.DirectShipKarastanProducts.map((item, index) => {
          return (
            <Col xs="12" sm="6" md="6" lg="4" className="mt-4" key={index}>
              <ProductCard
                onSelectProduct={this.onSelectProduct}
                inventory={this.state.inventoryIndex}
                ship={this.state.shipIndex}
                productIndex={item._id}
                data={
                  this.checkingSpecialCase(item)
                  // special_account.account ===
                  // this.props.accountData.mohawkAccount.toString() &&
                  // special_account._id === item._id
                  // ? special_product
                  // : item
                }
                type="check"
              />
            </Col>
          );
        })
      : Contants.DirectShipMohawkProducts.map((item, index) => {
          return (
            <Col xs="12" sm="6" md="6" lg="4" className="mt-4" key={index}>
              <ProductCard
                onSelectProduct={this.onSelectProduct}
                inventory={this.state.inventoryIndex}
                ship={this.state.shipIndex}
                productIndex={item._id}
                data={item}
                type="check"
              />
            </Col>
          );
        });
  };

  _renderDemoProducts = () => {
    return Contants.DemoProducts.map((item, index) => {
      return (
        <Col xs="12" sm="6" md="6" lg="4" className="mt-4" key={index}>
          <ProductCard
            onSelectProduct={this.onSelectProduct}
            inventory={this.state.inventoryIndex}
            ship={this.state.shipIndex}
            productIndex={item._id}
            data={item}
            type="check"
          />
        </Col>
      );
    });
  };

  _renderInventoryProducts = () => {
    return this.props.accountData.mohawkBrand === 'Karastan'
      ? Contants.InventoryKarastanProducts.map((item, index) => {
          return (
            <Col xs="12" sm="6" md="6" lg="4" className="mt-4" key={index}>
              <ProductCard
                onSelectProduct={this.onSelectProduct}
                inventory={this.state.inventoryIndex}
                ship={this.state.shipIndex}
                productIndex={item._id}
                data={item}
                type="multiple"
              />
            </Col>
          );
        })
      : this.props.accountData.vacuumAccount
      ? Contants.InventoryVacuumProducts.map((item, index) => {
          return (
            <Col xs="12" sm="6" md="6" lg="4" className="mt-4" key={index}>
              <ProductCard
                onSelectProduct={this.onSelectProduct}
                onSelectVacuumQuantity={this.props.onSelectVacuumQuantity}
                onSelectVacuumTotal={this.props.onSelectVacuumTotal}
                inventory={this.state.inventoryIndex}
                ship={this.state.shipIndex}
                productIndex={item._id}
                data={item}
                type="multiple"
                onVacuumChange={this.onVacuumChange}
                onVacuumAmountChange={this.onVacuumAmountChange}
              />
            </Col>
          );
        })
      : Contants.InventoryMohawkProducts.map((item, index) => {
          return (
            <Col xs="12" sm="6" md="6" lg="4" className="mt-4" key={index}>
              <ProductCard
                onSelectProduct={this.onSelectProduct}
                inventory={this.state.inventoryIndex}
                ship={this.state.shipIndex}
                productIndex={item._id}
                data={item}
                type="multiple"
              />
            </Col>
          );
        });
  };

  _renderMKTProducts = () => {
    return this.props.accountData.mohawkBrand === 'Mohawk'
      ? Contants.MKTMohawkProducts.map((item, index) => {
          return (
            <Col xs="12" sm="6" md="6" lg="6" className="mt-4" key={index}>
              <ProductCard
                onSelectProduct={this.onSelectProduct}
                inventory={this.state.inventoryIndex}
                ship={this.state.shipIndex}
                productIndex={item._id}
                data={item}
                type="check"
              />
            </Col>
          );
        })
      : Contants.MKTKarastanProducts.map((item, index) => {
          return (
            <Col xs="12" sm="6" md="6" lg="6" className="mt-4" key={index}>
              <ProductCard
                onSelectProduct={this.onSelectProduct}
                inventory={this.state.inventoryIndex}
                ship={this.state.shipIndex}
                productIndex={item._id}
                data={item}
                type="check"
              />
            </Col>
          );
        });
  };

  _renderProductsContent = orderType => {
    return (
      <Row className="justify-content-center mt-3">
        <Col sm="12" md="9">
          <Row className="justify-content-center">
            {orderType === 0 && this._renderInventoryProducts()}
            {orderType === 1 && this._renderDirectShipProducts()}
            {orderType === 2 && this._renderMKTProducts()}
            {orderType === 3 && this._renderDemoProducts()}
          </Row>
        </Col>
      </Row>
    );
  };

  render() {
    const { orderType } = this.props;
    return (
      <div className="text-center SelectProduct mx-auto ">
        {this._renderTopContent(orderType)}
        {this._renderProductsContent(orderType)}
        <Stats
          step={2}
          {...this.props}
          activeNextStep={
            (!isAdmin(this.props.user.roles) &&
              this.props.accountData &&
              this.props.accountData.vacuumAccount &&
              (this.state.vacuumCount < 4 ||
                this.state.minimumVacuumTotal < 1000)) ||
            (orderType === 1 || orderType === 2 || orderType === 3
              ? this.state.shipIndex && this.state.shipIndex.length === 0
              : orderType === 0
              ? this.state.inventoryIndex &&
                this.state.inventoryIndex.length === 0
              : false)
          }
        />
      </div>
    );
  }
}

const mapStateToProps = ({ salesform, account, auth }) => {
  const { orderType, inventory, ship, vacuumQuantity, vacuumTotal } = salesform;
  const { user } = auth;
  const { accountData } = account;
  return {
    orderType,
    inventory,
    ship,
    accountData,
    vacuumQuantity,
    vacuumTotal,
    user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectInventory: data => {
      dispatch(selectInventory(data));
    },
    onSelectShip: data => {
      dispatch(selectShip(data));
    },
    onSelectVacuumQuantity: data => {
      dispatch(selectVacuumQuantity(data));
    },
    onSelectVacuumTotal: data => {
      dispatch(selectVacuumTotal(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectProduct);
