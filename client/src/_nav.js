export default {
  items: [
    {
      title: true,
      name: 'Menu',
      wrapper: {
        element: '',
        attributes: {},
      },
    },
    {
      name: 'Dashboard',
      url: '/dealer-dashboard',
      icon: 'icon-speedometer',
    },
    {
      name: 'Shop',
      url: '/sales',
      icon: 'cui-cart',
    },
    {
      name: 'Settings',
      url: '/profile/:id',
      icon: 'icon-settings',
    },
    {
      name: 'Order History',
      url: '/Orders',
      icon: 'icon-screen-desktop',
    },
    {
      name: 'Program Details',
      url: '/programdetails',
      icon: 'icon-book-open',
    },
    {
      name: 'Contact Us',
      url: '/contact-us',
      icon: 'icon-speech',
    },
    // {
    //   name: 'Terms and Conditions',
    //   url: '/terms-and-conditions',
    //   icon: 'icon-notebook',
    // },
  ],
};
