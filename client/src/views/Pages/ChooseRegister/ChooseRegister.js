import React from 'react';
const ChooseRegister = props => {
  return (
    <>
      <p>How would you like to register?</p>
      <button
        onClick={() =>
          props.history.push({
            pathname: '/register',
            state: { type: 'mohawk' },
          })
        }
      >
        Mohawk or Karastan Dealer
      </button>
      <button
        onClick={() =>
          props.history.push({
            pathname: '/register',
            state: { type: 'vacuum' },
          })
        }
      >
        Vacuum Dealer
      </button>
    </>
  );
};

export default ChooseRegister;
