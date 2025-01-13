import React from 'react';
import { Route } from 'react-router-dom';
import { Redirect } from 'react-router';
import { connect, useSelector } from 'react-redux';

const AuthRoute = ({ match, component: Component, ...routeProps }) => {
  const loggedIn = useSelector(state => state.auth.isLoggedIn);
  return (
    <Route
      {...routeProps}
      render={componentProps => {
        if (routeProps.private) {
          if (!loggedIn) {
            return <Redirect to="/login" />;
          } else {
            return <Component {...componentProps} />;
          }
        } else {
          if (window.location.href.indexOf('/s/') > -1) {
            return <Component {...componentProps} />;
          }

          if (loggedIn) {
            return <Redirect to="/" />;
          } else {
            return <Component {...componentProps} />;
          }
        }
      }}
    />
  );
};

const mapStateToProps = store => ({
  loggedIn: store.auth.isLoggedIn,
});

export default connect(mapStateToProps)(AuthRoute);
