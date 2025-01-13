import { store } from 'react-notifications-component';
export const notification = (
  title,
  message = 'Disconnected Apis',
  type,
  container = 'top-right',
  timeout = 3000
) => {
  store.addNotification({
    title: title,
    message: message,
    type: type,
    container: container,
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    dismiss: {
      duration: timeout,
    },
  });
};
