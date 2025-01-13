import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import ReactNotifications from 'react-notifications-component';
import AppRoutes from './Routes/AppRoutes';
import AuthRoute from './Routes/AuthRoute';

import './App.scss';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import '../src/scss/all.scss';

class App extends Component {
  componentDidMount = () => {
    this.connecToServer();
  };
  connecToServer = () => {
    fetch('/');
  };

  render() {
    return (
      <>
        <ReactNotifications isMobile={true} />
        <Switch>
          {AppRoutes.map((prop, key) => {
            if (prop.redirect)
              return <Redirect from={prop.path} to={prop.to} key={key} />;
            return (
              <AuthRoute
                path={prop.path}
                component={prop.component}
                key={key}
                private={prop.private}
                name={prop.name}
              />
            );
          })}
        </Switch>
      </>
    );
  }
}

export default withRouter(App);
