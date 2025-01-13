import React, { useState } from 'react';

function useRadioButtons(name, selectChange) {
  const [value, setState] = useState(null);

  const handleChange = e => {
    setState(e.target.value);
    selectChange(e.target.value);
  };

  const inputProps = {
    name,
    type: 'radio',
    onChange: event => handleChange(event),
  };

  return [value, inputProps];
}

export { useRadioButtons };
