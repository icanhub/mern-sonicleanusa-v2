import React from 'react';

import Loadable from 'react-loadable';
const loading = () => (
  <div className="animated fadeIn pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse" />
  </div>
);

// Containers
const DefaultLayout = Loadable({
  loader: () => import('../containers/DefaultLayout'),
  loading,
});

// Pages
const Login = Loadable({
  loader: () => import('../views/Pages/Login'),
  loading,
});

// const ChooseRegister = Loadable({
//   loader: () => import('views/Pages/ChooseRegister'),
//   loading,
// });

const Register = Loadable({
  loader: () => import('../views/Pages/Register'),
  loading,
});

const ResetPassword = Loadable({
  loader: () => import('../views/Pages/ResetPassword'),
  loading,
});

const ResetPasswordEmail = Loadable({
  loader: () => import('../views/Pages/ResetPasswordEmail'),
  loading,
});

const SharingForm = Loadable({
  loader: () => import('../views/Pages/SharingForm'),
  loading,
});

const Page404 = Loadable({
  loader: () => import('../views/Pages/Page404'),
  loading,
});

const Page500 = Loadable({
  loader: () => import('../views/Pages/Page500'),
  loading,
});

const AppRoutes = [
  // Login/signup routes
  {
    path: '/login',
    name: 'Login Page',
    component: Login,
    private: false,
  },
  // {
  //   path: '/chooseregister',
  //   name: 'Choose Register Page',
  //   component: ChooseRegister,
  //   private: false,
  // },
  {
    path: '/register',
    name: 'Register Page',
    component: Register,
    private: false,
  },
  {
    path: '/confirmation/:token',
    name: 'Reset Password Page',
    component: ResetPassword,
    private: false,
  },
  {
    path: '/resetpassword',
    name: 'Reset Password Email Form Page',
    component: ResetPasswordEmail,
    private: false,
  },
  {
    path: '/s/:token',
    name: 'Mohawk Order Sharing',
    component: SharingForm,
    private: false,
  },
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    private: true,
  },
  {
    path: '/',
    name: 'Page 404',
    component: Page404,
    private: false,
  },
  {
    path: '/',
    name: 'Page 500',
    component: Page500,
    private: false,
  },

  // Fallback redirect
  { redirect: true, path: '/', to: '/', name: 'Home' },
];

export default AppRoutes;
