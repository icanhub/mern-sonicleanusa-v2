import { USER_ROLE } from '../_config/constants';

export const validate = getValidationSchema => {
  return values => {
    const validationSchema = getValidationSchema(values);
    try {
      validationSchema.validateSync(values, { abortEarly: false });
      return {};
    } catch (error) {
      return getErrorsFromValidationError(error);
    }
  };
};

export const getErrorsFromValidationError = validationError => {
  const FIRST_ERROR = 0;
  return validationError.inner.reduce((errors, error) => {
    return {
      ...errors,
      [error.path]: error.errors[FIRST_ERROR],
    };
  }, {});
};

export const getUploadedImage = name => {
  if (process.env.NODE_ENV === 'production') {
    return `/uploads/${name}`;
  } else {
    return `/uploads/${name}`;
  }
};

export const getUploadedMohawkPdf = name => {
  if (process.env.NODE_ENV === 'production') {
    return `/mohawk/${name}`;
  } else {
    return `/mohawk/${name}`;
  }
};

export const getUploadedPOfile = name => {
  if (process.env.NODE_ENV === 'production') {
    return `/POinfofiles/${name}`;
  } else {
    return `/POinfofiles/${name}`;
  }
};

export const getMangerUploadFile = name => {
  if (process.env.NODE_ENV === 'production') {
    return `https://dealers.sonicleanusa.com/manager/${name}`;
    // return `http://dev.dealers.sonicleanusa.com/manager/${name}`;
  } else {
    return `${process.env.REACT_APP_DEV_URL}/manager/${name}`;
  }
};

export const formatMoney = (
  amount,
  decimalCount = 2,
  decimal = '.',
  thousands = ','
) => {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? '-' : '';

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : '') +
      i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : '')
    );
  } catch (e) {
    console.log(e);
  }
};

export const getOrderTypefromCustRef = cust_ref => {
  return cust_ref.split('.')[1];
};

export function isDealer(userRole) {
  return userRole === USER_ROLE.DEALER;
}

export function isVacuumDealer(userRole) {
  return userRole === USER_ROLE.VACUUMDEALER;
}

export function isOfficial(userRole) {
  return userRole === USER_ROLE.OFFICIAL;
}

export function isManager(userRole) {
  return userRole === USER_ROLE.MANAGER;
}

export function isEmployee(userRole) {
  return userRole === USER_ROLE.EMPLOYEE;
}

export function isAdmin(userRole) {
  return userRole === USER_ROLE.MANAGER || userRole === USER_ROLE.OFFICIAL;
}

export function isWorker(userRole) {
  return userRole === USER_ROLE.DEALER || userRole === USER_ROLE.EMPLOYEE;
}
