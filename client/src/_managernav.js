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
      url: '/admin-dashboard',
      icon: 'icon-speedometer',
    },
    {
      name: 'Dealers',
      url: '/dealers',
      icon: 'icon-people',
    },
    {
      name: 'New Dealers',
      url: '/dealersactivation',
      icon: 'icon-user-follow',
      badge: {
        variant: 'danger',
        text: 'PRO',
      },
    },
    {
      name: 'Add new dealer',
      url: '/add-new-dealer',
      icon: 'icon-plus',
    },
    {
      name: 'Order History',
      url: '/Orders',
      icon: 'icon-screen-desktop',
    },
    {
      name: 'Manager',
      url: '/manager',
      icon: 'icon-bulb',
    },
    {
      name: 'Program Details',
      url: '/programdetails',
      icon: 'icon-book-open',
    },
    {
      name: 'Karastan List ',
      url: '/karastan-list',
      icon: 'icon-ghost',
    },
    {
      name: 'Dealer Locator ',
      url: '/dealer-locator',
      icon: 'icon-location-pin',
    },
  ],
};
