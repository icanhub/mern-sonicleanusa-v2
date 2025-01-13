import React, { Component } from 'react';
import classNames from 'classnames';

import { Card, CardBody } from 'reactstrap';
import { AppSwitch } from '@coreui/react';
import './OrderTypeItem.scss';

class OrderTypeItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
    };
  }

  componentDidMount = () => {
    this.onCheckStatus();
  };

  onMouseOver = () => {
    this.setState({ hover: true });
  };

  onMouseOut = () => {
    this.setState({ hover: false });
  };

  onSelect = () => {
    this.props.onSelected(this.props.type, !this.state.selected);
  };

  onCheckStatus = () => {
    const { selectedIndex, type } = this.props;
    if (selectedIndex === type) {
      this.setState({ selected: true });
    } else {
      this.setState({ selected: false });
    }
  };

  render() {
    const { info, selectedIndex, type } = this.props;
    return (
      <Card
        className={classNames('OrderTypeItem h-100 w-100 ', {
          'border-success OrderTypeItem--checked': selectedIndex === type,
        })}
        onClick={this.onSelect}
      >
        <CardBody className="d-flex flex-column h-100">
          <h4
            className={classNames(
              'font-weight-bold text-muted',
              selectedIndex === type ? 'OrderTypeItem__text' : ''
            )}
          >
            {info.title}
          </h4>
          <h5
            className={classNames(
              'font-weight-bold text-muted mb-4',
              selectedIndex === type ? 'OrderTypeItem__text' : ''
            )}
          >
            {info.name}
          </h5>
          {info.description && (
            <h6
              className={classNames(
                'text-muted',
                selectedIndex === type ? 'OrderTypeItem__text' : ''
              )}
            >
              {info.description}
            </h6>
          )}
          <AppSwitch
            className={'mx-1 mt-auto'}
            checked={selectedIndex === type}
            disabled={true}
            color={'success'}
            onChange={() => {
              return;
            }}
            label
            dataOn={'selected'}
            dataOff={'select'}
          />
        </CardBody>
      </Card>
    );
  }
}

export default OrderTypeItem;
