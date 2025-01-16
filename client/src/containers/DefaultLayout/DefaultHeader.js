import React, { Component } from "react";
import { Nav, Badge } from "reactstrap";
import PropTypes from "prop-types";
import { isAdmin } from "../../_helpers/helper";

import { AppNavbarBrand, AppSidebarToggler } from "@coreui/react";
import logo from "../../assets/img/brand/logo.png";
import { useMediaQuery } from "react-responsive";

const Default = ({ children }) => {
  const isNotMobile = useMediaQuery({ minWidth: 768 });
  return isNotMobile ? children : null;
};
const Mobile = ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return isMobile ? children : null;
};

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  render() {
    // eslint-disable-next-line
    const { children, openCovidUpdate, user, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand full={{ src: logo, width: 200, alt: "CoreUI Logo" }} />
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <Default>
          <Nav className="m-auto" navbar>
            <h5 className=" notify_box text-danger" onClick={openCovidUpdate}>
              {isAdmin(user.roles)
                ? "Program Update – December 15 2024"
                : user.mohawkAccount
                ? "Program Update – December 15 2024"
                : "Program Update – December 15 2024"}
            </h5>

            <div className="notify_box" onClick={openCovidUpdate}>
              <i className="icon-bell"></i>
              <Badge pill color="danger" className="notify-badge">
                1
              </Badge>
            </div>
          </Nav>
        </Default>
        <Mobile>
          <Nav className="m-right" navbar>
            <div className="notify_box" onClick={openCovidUpdate}>
              <i className="icon-bell"></i>
              <Badge pill color="danger" className="notify-badge">
                1
              </Badge>
            </div>
          </Nav>
        </Mobile>
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
