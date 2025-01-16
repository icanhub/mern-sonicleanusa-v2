import React, { useEffect, useState, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { logout } from '../../reducers/auth';
import { Link } from 'react-router-dom';

import {
  AppAside,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
import officialnav from '../../_officialnav';
import managernav from '../../_managernav';
// routes config
import routes from '../../Routes/routes';
import {
  getUploadedImage,
  isManager,
  isOfficial,
  isAdmin,
} from '../../_helpers/helper';
// import { fetchNewDealersList } from '../../modules/official';
import { fetchNewDealersList } from '../../reducers/official';
import LogOutModal from '../../components/LogOutModal';
import CovidModal from '../../components/CovidModal';

const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const DefaultLayout = () => {
  const user = useSelector(state => state.auth.user);
  console.log('user',user)
  const newDealerList = useSelector(state => state.official.newDealerList);

  const loading = () => (
    <div className="animated fadeIn pt-1 text-center">
      <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
  );

  const [nav, setNav] = useState(navigation);

  const [modal, setModal] = useState(false);
  const [covidModal, setCovidModal] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    if (isManager(user.roles)) {
      let n = managernav.items.map(item => {
        if (item.name === 'New Dealers') {
          item.badge.text =
            newDealerList && newDealerList.length > 1
              ? `${newDealerList.length} NEW`
              : ``;
        }
        return item;
      });
      let dn = {};
      dn.items = n;
      setNav(dn);
    } else if (isOfficial(user.roles)) {
      let n = officialnav.items.map(item => {
        if (item.name === 'New Dealers') {
          item.badge.text =
            newDealerList && newDealerList.length > 1
              ? `${newDealerList.length} NEW`
              : `${newDealerList.length} NEW`;
        }
        return item;
      });
      let dn = {};
      dn.items = n;
      setNav(dn);
    } else {
      let n = navigation.items.map(item => {
        if (item.name === 'Shop') {
          item.url = `/sales/${user.id}`;
        }
        if (item.name === 'Settings') {
          item.url = `/profile/account/${user.id}`;
        }
        if (item.name === 'Orders') {
          item.url = `/orders/${user.id}`;
        }
        return item;
      });
      let dn = {};
      dn.items = n;
      setNav(dn);
    }
  }, [newDealerList]);

  useEffect(() => {
    dispatch(fetchNewDealersList({ isVerified: false }));
  }, []);

  const signOut = e => {
    setModal(true);
  };

  const openCovidUpdate = () => {
    setCovidModal(true);
  };

  return (
    <div className="app">
      <LogOutModal
        modal={modal}
        onClickYes={() => {
          dispatch(logout());
        }}
        onClickNo={() => {
          setModal(false);
        }}
      />
      <CovidModal
        modal={covidModal}
        closeCovidModal={() => setCovidModal(false)}
      />
      <AppHeader fixed>
        <Suspense fallback={loading()}>
          <DefaultHeader
            onLogout={e => signOut(e)}
            openCovidUpdate={openCovidUpdate}
            user={user}
          />
        </Suspense>
      </AppHeader>
      <div className="app-body">
        <AppSidebar fixed display="lg" minimized={false} offCanvas>
          <AppSidebarHeader>
            <img
              src={
                user.userPhoto === undefined
                  ? require('../../assets/img/emptylogo.png')
                  : getUploadedImage(user.userPhoto)
              }
              className="img-avatar"
              alt="Avatar"
            ></img>
            <div>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
            </div>
            <h6 className="text-muted font-weight-normal">
              {user.companyName}
            </h6>
          </AppSidebarHeader>
          <AppSidebarForm />
          <Suspense>
            <AppSidebarNav navConfig={nav} />
            <Link
              style={{ width: '100%' }}
              to="#"
              className="nav-link"
              onClick={e => signOut(e)}
            >
              {' '}
              <i className="nav-icon fa fa-lock"></i> Logout{' '}
            </Link>
          </Suspense>
          <AppSidebarFooter />
        </AppSidebar>
        <main className="main">
          <Container fluid className="mt-4 mb-4">
            <Suspense fallback={loading()}>
              <Switch>
                {routes.map((route, idx) => {
                  return route.component ? (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      render={props => (
                        <route.component
                          {...props}
                          isVerified={route.isVerified}
                        />
                      )}
                    />
                  ) : null;
                })}
                <Redirect
                  from="/"
                  to={
                    isAdmin(user.roles)
                      ? '/admin-dashboard'
                      : `/dealer-dashboard`
                  }
                />
              </Switch>
            </Suspense>
          </Container>
        </main>
        <AppAside fixed>
          <Suspense fallback={loading()}>{/* <DefaultAside /> */}</Suspense>
        </AppAside>
      </div>
      <AppFooter>
        <Suspense fallback={loading()}>
          <DefaultFooter />
        </Suspense>
      </AppFooter>
    </div>
  );
};

export default withRouter(DefaultLayout);
