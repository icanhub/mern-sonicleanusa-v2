import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Progress,
} from 'reactstrap';

const propTypes = {
  notif: PropTypes.bool,
  accnt: PropTypes.bool,
  tasks: PropTypes.bool,
  mssgs: PropTypes.bool,
};
const defaultProps = {
  notif: false,
  accnt: false,
  tasks: false,
  mssgs: false,
};

class DefaultHeaderDropdown extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  dropNotif() {
    const itemsCount = 5;
    return (
      <Dropdown
        nav
        className="d-md-down-none"
        isOpen={this.state.dropdownOpen}
        toggle={this.toggle}
      >
        <DropdownToggle nav>
          <i className="icon-bell"></i>
          <Badge pill color="danger">
            {itemsCount}
          </Badge>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem header tag="div" className="text-center">
            <strong>You have {itemsCount} notifications</strong>
          </DropdownItem>
          <DropdownItem>
            <i className="icon-user-follow text-success"></i> New user
            registered
          </DropdownItem>
          <DropdownItem>
            <i className="icon-user-unfollow text-danger"></i> User deleted
          </DropdownItem>
          <DropdownItem>
            <i className="icon-chart text-info"></i> Sales report is ready
          </DropdownItem>
          <DropdownItem>
            <i className="icon-basket-loaded text-primary"></i> New client
          </DropdownItem>
          <DropdownItem>
            <i className="icon-speedometer text-warning"></i> Server overloaded
          </DropdownItem>
          <DropdownItem header tag="div" className="text-center">
            <strong>Server</strong>
          </DropdownItem>
          <DropdownItem>
            <div className="text-uppercase mb-1">
              <small>
                <b>CPU Usage</b>
              </small>
            </div>
            <Progress className="progress-xs" color="info" value="25" />
            <small className="text-muted">348 Processes. 1/4 Cores.</small>
          </DropdownItem>
          <DropdownItem>
            <div className="text-uppercase mb-1">
              <small>
                <b>Memory Usage</b>
              </small>
            </div>
            <Progress className="progress-xs" color="warning" value={70} />
            <small className="text-muted">11444GB/16384MB</small>
          </DropdownItem>
          <DropdownItem>
            <div className="text-uppercase mb-1">
              <small>
                <b>SSD 1 Usage</b>
              </small>
            </div>
            <Progress className="progress-xs" color="danger" value={90} />
            <small className="text-muted">243GB/256GB</small>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  dropTasks() {
    const itemsCount = 15;
    return (
      <Dropdown
        nav
        className="d-md-down-none"
        isOpen={this.state.dropdownOpen}
        toggle={this.toggle}
      >
        <DropdownToggle nav>
          <i className="icon-list"></i>
          <Badge pill color="warning">
            {itemsCount}
          </Badge>
        </DropdownToggle>
        <DropdownMenu right className="dropdown-menu-lg">
          <DropdownItem header tag="div" className="text-center">
            <strong>You have {itemsCount} pending tasks</strong>
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">
              Upgrade NPM &amp; Bower{' '}
              <span className="float-right">
                <strong>0%</strong>
              </span>
            </div>
            <Progress className="progress-xs" color="info" value={0} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">
              ReactJS Version{' '}
              <span className="float-right">
                <strong>25%</strong>
              </span>
            </div>
            <Progress className="progress-xs" color="danger" value={25} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">
              VueJS Version{' '}
              <span className="float-right">
                <strong>50%</strong>
              </span>
            </div>
            <Progress className="progress-xs" color="warning" value={50} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">
              Add new layouts{' '}
              <span className="float-right">
                <strong>75%</strong>
              </span>
            </div>
            <Progress className="progress-xs" color="info" value={75} />
          </DropdownItem>
          <DropdownItem>
            <div className="small mb-1">
              Angular 2 Cli Version{' '}
              <span className="float-right">
                <strong>100%</strong>
              </span>
            </div>
            <Progress className="progress-xs" color="success" value={100} />
          </DropdownItem>
          <DropdownItem className="text-center">
            <strong>View all tasks</strong>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  render() {
    const { notif, tasks } = this.props;
    return notif ? this.dropNotif() : tasks ? this.dropTasks() : null;
  }
}

DefaultHeaderDropdown.propTypes = propTypes;
DefaultHeaderDropdown.defaultProps = defaultProps;

export default DefaultHeaderDropdown;
