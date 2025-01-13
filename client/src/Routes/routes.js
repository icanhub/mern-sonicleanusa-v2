import React from 'react';
import DefaultLayout from '../containers/DefaultLayout';

const SalesForm = React.lazy(() => import('../views/SalesForm'));
const Profile = React.lazy(() => import('../views/Profile'));
const Orders = React.lazy(() => import('../views/Orders'));
const OrderDetail = React.lazy(() => import('../views/OrderDetail'));
const Dealers = React.lazy(() => import('../views/Dealers'));
const NewDealer = React.lazy(() => import('../views/NewDealer'));
const Manager = React.lazy(() => import('../views/Manager'));
//const ProgramDetails = React.lazy(() => import('../views/ProgramDetails'));
const ContactUs = React.lazy(() => import('../views/ContactUs'));
const TermsAndConditions = React.lazy(() =>
  import('../views/TermsAndConditions')
);
const DealerDashboard = React.lazy(() => import('../views/DealerDashboard'));
const AdminDashboard = React.lazy(() => import('../views/AdminDashboard'));
const KarastanList = React.lazy(() => import('../views/KarastanList'));
const DealerLocator = React.lazy(() => import('../views/DealerLocator'));

const Page404 = React.lazy(() => import('../views/Pages/Page404'));

const routes = [
  {
    path: '/',
    exact: true,
    name: 'Soniclean',
    component: DefaultLayout,
    private: true,
  },
  {
    path: '/404',
    exact: true,
    name: 'Soniclean',
    component: Page404,
    private: true,
  },
  { path: '/sales/:id', name: 'Sales', component: SalesForm, private: true },
  {
    path: '/profile',
    exact: false,
    name: 'Profile',
    component: Profile,
    private: true,
  },
  {
    path: '/orders/:id',
    exact: true,
    name: 'Orders',
    component: Orders,
    private: true,
  },
  {
    path: '/orders',
    exact: true,
    name: 'Orders',
    component: Orders,
    private: true,
  },
  {
    path: '/order/:id',
    exact: true,
    name: 'OrderDetail',
    component: OrderDetail,
    private: true,
  },
  {
    path: '/dealers',
    exact: true,
    name: 'Dealers',
    component: Dealers,
    isVerified: true,
    private: true,
  },
  {
    path: '/add-new-dealer',
    exact: true,
    name: 'New-Dealer',
    component: NewDealer,
    isVerified: true,
    private: true,
  },
  {
    path: '/dealersactivation',
    exact: true,
    name: 'Dealers Activation',
    component: Dealers,
    isVerified: false,
    private: true,
  },
  {
    path: '/manager',
    exact: false,
    name: 'Manager',
    component: Manager,
    isVerified: true,
    private: true,
  },
  {
    path: '/programdetails',
    exact: true,
    name: 'ProgramDetails',
    component: Manager,
    isVerified: true,
    private: true,
  },
  {
    path: '/karastan-list',
    exact: true,
    name: 'KarastanList',
    component: KarastanList,
    isVerified: true,
    private: true,
  },
  {
    path: '/contact-us',
    exact: true,
    name: 'ContactUs',
    component: ContactUs,
    isVerified: true,
    private: true,
  },
  {
    path: '/terms-and-conditions',
    exact: true,
    name: 'TermsAndConditions',
    component: TermsAndConditions,
    isVerified: true,
    private: true,
    permission: ['dealer'],
  },
  {
    path: '/dealer-dashboard',
    exact: true,
    name: 'DealerDashboard',
    component: DealerDashboard,
    isVerified: true,
    private: true,
    permission: ['dealer', 'employee'],
  },
  {
    path: '/admin-dashboard',
    exact: true,
    name: 'AdminDashboard',
    component: AdminDashboard,
    isVerified: true,
    private: true,
    permission: ['offical', 'manager'],
  },
  {
    path: '/dealer-locator',
    exact: true,
    name: 'DealerLocator',
    component: DealerLocator,
    isVerified: true,
    private: true,
    permission: ['offical', 'manager'],
  },
];

export default routes;
