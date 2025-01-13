import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import * as Contants from '../../../../_config/constants';
import { isVacuumDealer } from '../../../../_helpers/helper';
import { special_accounts, special_products } from '../../../../_config/constants';
import './ProductBox.scss';

const ProductBox = ({ item, orderType, quantity, setPrice }) => {
  const [product, setProduct] = useState();

  const accountData = useSelector(state => state.account.accountData);
  useEffect(() => {
    let result;
    let temp;
    if (orderType === 1) {
      temp = Contants.DirectShipKarastanProducts.filter(
        product => product._id === item
      );
      result = temp.map(item => {
        return checkingSpecialCase(item);
      });
    } else if (orderType === 0) {
      result = accountData.vacuumAccount
        ? Contants.InventoryVacuumProducts.filter(
            product => product._id === item
          )
        : Contants.InventoryKarastanProducts.filter(
            product => product._id === item
          );
    } else if (orderType === 3) {
      result = Contants.DemoProducts.filter(product => product._id === item);
    } else {
      result = Contants.MKTKarastanProducts.filter(
        product => product._id === item
      );
    }
    setProduct(result[0]);
  }, [item]);

  const checkingSpecialCase = item => {
    for (var i = 0; i < special_accounts.length; i++) {
      if (
        accountData.mohawkAccount &&
        special_accounts[i].account === accountData.mohawkAccount.toString()
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

  const getPrice = product => {
    if (orderType === 0) {
      if (quantity * product.multiples >= 10) {
        setPrice((product.discount * quantity * product.multiples) / 100);
        return (product.discount / 100).toFixed(2);
      } else {
        setPrice((product.price * quantity * product.multiples) / 100);
        return (product.price / 100).toFixed(2);
      }
    } else if (orderType === 1 || orderType === 3 || orderType === 2) {
      setPrice(product.price / 100);
      return (product.price / 100).toFixed(2);
    }
  };

  return (
    <>
      <Row className="ProductBox align-items-center mt-5">
        <Col md="4">
          <img src={product && product.image} alt="p1" className="img-fluid" />
        </Col>
        <Col className="text-black text-right" md="8">
          <h6 className="font-weight-normal">{product && product.name}</h6>
          <h6 className="mt-1">
            ${product && getPrice(product)} / {product && product.unit}
          </h6>
          <h6 className="mt-1">
            QTY:{' '}
            {orderType === 1 || orderType === 3 || orderType === 2
              ? '1'
              : product && quantity * product.multiples}
          </h6>
        </Col>
      </Row>
      <hr />
    </>
  );
};

export default ProductBox;
