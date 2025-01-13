import React from 'react';
import { Col, Row } from 'reactstrap';

import './ProductInformationModal.scss';

const ProductInformationModal = ({ data, ordertype }) => {
  return (
    <div className="productinformationmodal">
      <Row className="flex-column-reverse flex-md-row">
        <Col className="mt-2 text-dark ">
          <h5 className="text-dark">{data.name}</h5>
          <h6>{data.description}</h6>

          {ordertype === 'multiple' && (
            <>
              <h6 className="mt-3">
                Inventory Cost(QTY 2-8): $ {Number(data.price / 100).toFixed(2)}
                /item
              </h6>
              <h6 className="mt-1">
                Inventory Cost(QTY 10+): ${' '}
                {Number(data.discount / 100).toFixed(2)}/item
              </h6>
            </>
          )}
          {ordertype !== 'multiple' && (
            <h6 className="mt-3">
              Direct Ship Cost: $ {Number(data.price / 100).toFixed(2)}
            </h6>
          )}

          <h6 className="mt-2">
            Retail Map Price: $ {Number(data.retailMap / 100).toFixed(2)}
          </h6>

          <h6 className="mt-3 font-weight-normal">
            Orders ship the next business day. Shipping transit time is 3-5
            business days.
          </h6>
        </Col>
      </Row>
    </div>
  );
};

export default ProductInformationModal;
