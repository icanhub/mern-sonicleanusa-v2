import React from 'react';
import classNames from 'classnames';
import './Nav.scss';

const items = ['Order Type', 'Products', 'Shipping', 'Payment'];

const Nav = ({ activeStep }) => {
  const dots = [];
  for (let i = 1; i <= 4; i += 1) {
    const isActive = activeStep >= i;

    dots.push(
      <div className="Nav__item m-1" key={i}>
        <div
          className={classNames(
            'Nav__content',
            isActive ? 'text-primary' : 'text-secondary'
          )}
        >
          <span className="mr-1">{i}</span>
          {items[i - 1]}
        </div>
        <div
          className={classNames(
            'Nav__border',
            isActive ? 'bg-primary' : 'bg-secondary'
          )}
        ></div>
      </div>
    );
  }

  return (
    <div className="Nav d-md-flex justify-content-between w-100">{dots}</div>
  );
};

export default Nav;
