import React from "react";
import { Route, Switch, Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import Account from "../Account";
import Users from "../Users";
import FileUploads from "../FileUploads";

const TabContainer = ({ location, accountData }) => {
  const isPath = (path) => location.pathname.substr(0, path.length) === path;

  return (
    <div className="TabContainer">
      <Card className="pt-2">
        <CardBody>
          <section>
            <Nav pills className="Tabs text-info">
              <NavItem>
                <NavLink
                  tag={Link}
                  to={`/manager/account`}
                  active={isPath("/manager/account")}
                >
                  My Account
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={Link}
                  to={`/manager/users`}
                  active={isPath("/manager/users")}
                >
                  Users
                </NavLink>
              </NavItem>
              {/* <NavItem>
                <NavLink
                  tag={Link}
                  to={`/manager/billing/${accountData._id}`}
                  active={isPath('/manager/billing')}
                >
                  API Keys
                </NavLink>
              </NavItem> */}
              <NavItem>
                <NavLink
                  tag={Link}
                  to={`/manager/uploads`}
                  active={isPath("/manager/uploads")}
                >
                  File Upload
                </NavLink>
              </NavItem>
            </Nav>
          </section>
          <Switch>

            <Route
              exact
              path="/manager"
              render={() => <Redirect to="/manager/account" />}
            />
            <Route
              exact
              path="/programdetails"
              render={() => <Redirect to="/manager/account" />}
            />
            <Route
              exact
              path="/manager/account"
              render={(props) => <Account {...props} />}
            />

            <Route
              exact
              path="/manager/users"
              render={(props) => <Users {...props} />}
            />
            <Route
              exact
              path="/manager/uploads"
              render={(props) => <FileUploads {...props} />}
            />
            {/* <Route exact path="/manager/uploads" component={FileUploads} /> */}
            {/* <Route exact path="/manager/store" component={Account} /> */}
          </Switch>
        </CardBody>
      </Card>
    </div>
  );
};

const mapStateToProps = ({ account }) => {
  const { accountData, state } = account;
  return { accountData, state };
};

export default withRouter(connect(mapStateToProps, null)(TabContainer));
