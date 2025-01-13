import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { onSelectUsers } from '../../../../reducers/salesForm';
import { fetchUsers } from '../../../../reducers/Users';

import 'react-select/dist/react-select.min.css';

const EmailNotification = ({
  selectUsers,
  fetchUsers,
  selectedUsers,
  accountData,
  usersData,
}) => {
  useEffect(() => {
    fetchUsers(accountData._id);
  }, []);

  const saveChanges = data => {
    selectUsers(data);
  };

  const getOptions = data => {
    let options =
      data &&
      data.map(item => {
        let p = {};
        p.label = item.email;
        p.value = item.email;
        return p;
      });

    return options;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="font-weight-normal text-black"> Email Notification </h3>
      </div>
      <h6 className="text-black font-weight-normal mt-2">
        To CC employees on order confirmation emails, you will have to create an
        account for them in your company profile page.
      </h6>
      <div className="mt-3 mb-5">
        <Select
          name="form-field-name2"
          value={selectedUsers}
          options={getOptions(usersData)}
          onChange={saveChanges}
          multi
        />
      </div>
    </div>
  );
};

const mapStateToProps = ({ users, salesform, account }) => {
  const { usersData } = users;
  const { accountData } = account;
  const { selectedUsers } = salesform;
  return { usersData, selectedUsers, accountData };
};

const mapDispatchToProps = dispatch => {
  return {
    selectUsers: users => {
      dispatch(onSelectUsers(users));
    },
    fetchUsers: id => {
      dispatch(fetchUsers(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailNotification);
