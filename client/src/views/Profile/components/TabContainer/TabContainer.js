import React from 'react';
import { Route, Switch, Link, Redirect } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { withRouter } from 'react-router';
import { Card, CardBody, Nav, NavItem, NavLink } from 'reactstrap';
import Account from '../Account';
import Notes from '../Notes';
import Company from '../Company';
import PaymentMethods from '../PaymentMethods';
import Users from '../Users';
import StoreLocations from '../StoreLocations';
import Orders from '../Orders';
import NotFoundPage from '../NotFoundPage';
import { isOfficial, isAdmin } from '../../../../_helpers/helper';
import './TabContainer.scss';

const TabContainer = ({ location, accountData }) => {
  const user = useSelector(state => state.auth.user);
  const isPath = path => location.pathname.substr(0, path.length) === path;

  return (
    <div className="TabContainer">
      <Card className="pt-2">
        <CardBody>
          <section>
            <Nav pills className="Tabs text-info">
              <NavItem>
                <NavLink
                  tag={Link}
                  to={`/profile/account/${accountData._id}`}
                  active={isPath('/profile/account')}
                >
                  My Account
                </NavLink>
              </NavItem>
              {accountData.roles === 'dealer' ||
              accountData.roles === 'vacuum-dealer' ? (
                <>
                  <NavItem>
                    <NavLink
                      tag={Link}
                      to={`/profile/company/${accountData._id}`}
                      active={isPath('/profile/company')}
                    >
                      Company Profile
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      tag={Link}
                      to={`/profile/users/${accountData._id}`}
                      active={isPath('/profile/users')}
                    >
                      Users
                    </NavLink>
                  </NavItem>
                </>
              ) : null}
              <NavItem>
                <NavLink
                  tag={Link}
                  to={`/profile/store/${accountData._id}`}
                  active={isPath('/profile/store')}
                >
                  Store Locations
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={Link}
                  to={`/profile/billing/${accountData._id}`}
                  active={isPath('/profile/billing')}
                >
                  Payment Methods
                </NavLink>
              </NavItem>
              {accountData.roles === 'dealer' ||
              accountData.roles === 'vacuum-dealer' ? (
                <NavItem>
                  <NavLink
                    tag={Link}
                    to={`/profile/orders/${accountData._id}`}
                    active={isPath('/profile/orders')}
                  >
                    Orders
                  </NavLink>
                </NavItem>
              ) : null}
              {isOfficial(user.roles) ? (
                <NavItem>
                  <NavLink
                    tag={Link}
                    to={`/profile/notes/${accountData._id}`}
                    active={isPath('/profile/notes')}
                  >
                    Add Note
                  </NavLink>
                </NavItem>
              ) : null}
              {/* <NavItem>
                                <NavLink tag={Link} to="/profile/active" active={isPath('/profile/active')} >
                                    Activity Log
                                </NavLink>
                            </NavItem> */}
            </Nav>
          </section>
          <Switch>
            {/* <Redirect exact from="/profile" to="/profile/account/:id" /> */}
            <Route exact path="/profile/account/:id" component={Account} />
            <Route exact path="/profile/company/:id" component={Company} />
            <Route
              exact
              path="/profile/billing/:id"
              component={PaymentMethods}
            />
            <Route exact path="/profile/users/:id" component={Users} />
            <Route exact path="/profile/store/:id" component={StoreLocations} />
            <Route exact path="/profile/orders/:id" component={Orders} />
            <Route exact path="/profile/notes/:id" component={Notes} />
            <Route path="*" component={NotFoundPage} />
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
