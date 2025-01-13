import Cookies from 'universal-cookie';

export const tokenName = 'jwtToken';
export const dealerIdName = 'dealerid';
export const userIdName = 'userId';
const cookies = new Cookies();
export const getToken = () => {
  return cookies.get(tokenName);
};

export const getDealerId = () => {
  return cookies.get(dealerIdName);
};

export const getUserId = () => {
  return cookies.get(userIdName);
};

export const setToken = (token, created, ttl, dealerId) => {
  cookies.set(tokenName, token, { maxAge: ttl });
  cookies.set(dealerIdName, dealerId);
};

export const setDealerId = dealerId => {
  cookies.set(dealerIdName, dealerId);
};

export const setUserId = userId => {
  cookies.set(userIdName, userId);
};

export const removeToken = () => {
  cookies.remove(tokenName);
  cookies.remove(dealerIdName);
  cookies.remove(userIdName);
};
