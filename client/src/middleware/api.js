import axios from "axios";
import { API } from "../utils/apiCall";
// import { logout } from '../modules/auth/reducer';
import { logout } from "../reducers/auth";
const apiMiddleware = ({ dispatch }) => (next) => (action) => {
  next(action);

  if (action.type !== API) return;

  const {
    url,
    method,
    data,
    accessToken,
    onStart,
    onSuccess,
    onFailure,
    label,
    headers,
  } = action.payload;

  const dataOrParams = ["GET", "DELETE"].includes(method) ? "params" : "data";


  if (label === "soniclean/orderhistory/updatesharedorderinfo") {
    axios.defaults.headers.common["Content-Type"] = "multipart/form-data";
  } else {
    axios.defaults.headers.common["Content-Type"] = "application/json";
  }
  // axios default configs
  axios.defaults.headers.common["Authorization"] = `${accessToken}`;

  if (label) {
    dispatch(onStart(label));
  }

  axios
    .request({
      url,
      method,
      headers,
      [dataOrParams]: data,
    })
    .then((res) => {
      dispatch(onSuccess(res.data));
    })
    .catch((error) => {
      if (error.response) {
        if (error.response.data === "Unauthorized") {
          dispatch(logout());
        }
        dispatch(onFailure(error.response.data));
      }
    });
};

export default apiMiddleware;
