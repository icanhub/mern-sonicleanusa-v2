export const API = 'API';

function apiAction({
  url = '',
  method = 'GET',
  data = null,
  accessToken = null,
  onStart = () => {},
  onSuccess = () => {},
  onFailure = () => {},
  label = '',
  headersOverride = null,
}) {
  return {
    type: API,
    payload: {
      url,
      method,
      data,
      accessToken,
      onStart,
      onSuccess,
      onFailure,
      label,
      headersOverride,
    },
  };
}

export { apiAction };
