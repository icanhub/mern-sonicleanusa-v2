import React from 'react';
import { Link } from 'react-router-dom';
import SubmitOrderModal from '../../../../components/SubmitOrderModal/SubmitOrderModal';

const ProductInfo = ({
  onSubmitOrder,
  state,
  onResetOrder,
  totalPrice,
  discount,
}) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="font-weight-bold text-muted">Subtotal</h6>
        <h6 className="text-primary">${totalPrice.toFixed(2)}</h6>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <h6 className="font-weight-bold text-muted">Shipping</h6>
        <h6 className="text-primary">$00.00</h6>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <h6 className="font-weight-bold text-muted">Tax</h6>
        <h6 className="text-primary">$00.00</h6>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <h6 className="font-weight-bold text-muted">Discount</h6>
        <h6 className="text-primary">${discount && discount.toFixed(2)}</h6>
      </div>
      <hr />
      <div className="d-flex justify-content-between align-items-center mt-3">
        <h6 className="font-weight-bold text-muted">Total</h6>
        <h6 className="text-primary">${(totalPrice - discount).toFixed(2)}</h6>
      </div>
      <SubmitOrderModal
        onSubmitOrder={onSubmitOrder}
        state={state}
        onResetOrder={onResetOrder}
      />
      <div>
        <h6 className="text-muted mt-4">
          By submitting this order, you agree to the{' '}
          <Link to="/programdetails">terms & conditions</Link> of Soniclean’s
          MAP policy.
        </h6>
      </div>
    </div>
  );
};

export default ProductInfo;
