import React from 'react';

import { Spinner } from 'reactstrap';

export default () => {
  return (
    <div className="loading-spinner">
      <Spinner className="spinner-block" />
    </div>
  );
};
