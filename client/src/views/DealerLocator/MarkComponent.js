import React from 'react';

import { Button, Popover, PopoverBody } from 'reactstrap';
import mark from '../../assets/img/mark.png';

const MarkComponent = ({ order, isOpen, toggle, index }) => {
  return (
    <div className="marker">
      <Popover
        trigger="focus"
        placement="top"
        target={`PopoverFocus${order.ship_zip}`}
        isOpen={isOpen}
      >
        <PopoverBody>
          <div className="list_item">
            <h5>{order.ship_company}</h5>
            <h6>
              <i className="fa fa-map-marker" aria-hidden="true"></i>{' '}
              {order.ship_address_1} {order.ship_address_2} {order.ship_city}{' '}
              {order.ship_state} {order.ship_zip}
            </h6>
            <h6>
              <i className="fa fa-phone" aria-hidden="true"></i>{' '}
              {order.createdBy.length > 0 && order.createdBy[0].phoneNumber}
            </h6>
            <h6>
              <i className="fa fa-link" aria-hidden="true"></i>{' '}
              {order.createdBy.length > 0 && order.createdBy[0].websiteURL}
            </h6>
          </div>
        </PopoverBody>
      </Popover>
      <Button
        id={`PopoverFocus${order.ship_zip}`}
        type="button"
        onClick={() => toggle(`PopoverFocus${order.ship_zip}`, index)}
      >
        <img src={mark} alt="mark" style={{ width: 30, height: 30 }} />
      </Button>
    </div>
  );
};

export default MarkComponent;
