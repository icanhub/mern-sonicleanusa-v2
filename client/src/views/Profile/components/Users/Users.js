import React, { useEffect } from 'react';
import { Row, Col, Table } from 'reactstrap';
import { connect, useSelector, useDispatch } from 'react-redux';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import AddNewUserModal from '../../../../components/AddNewUserModal/AddNewUserModal';
import {
  fetchUsers,
  deleteUserRequest,
  saveUser,
  resetAddUserState,
} from '../../../../reducers/Users';
import { isPending } from '../../../../utils/state';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';

import './Users.scss';

const Users = ({ resetAddUserState }) => {
  const dispatch = useDispatch();
  const fetching_state = useSelector(state => state.users.fetching_state);
  const posting_state = useSelector(state => state.users.posting_state);
  const deleting_state = useSelector(state => state.users.deleting_state);
  const accountData = useSelector(state => state.account.accountData);
  const usersData = useSelector(state => state.users.usersData);

  useEffect(() => {
    dispatch(fetchUsers(accountData._id));
  }, []);

  const deleteUser = (id, dealer) => {
    dispatch(deleteUserRequest(id, dealer));
  };

  const saveEmployee = values => {
    let data = values;
    data.companyName = accountData.companyName;
    if (accountData.mohawkAccount) {
      data.mohawkAccount = accountData.mohawkAccount;
      data.mohawkBrand = accountData.mohawkBrand;
      }
      if (accountData.vacuumAccount) {
      data.vacuumAccount = accountData.vacuumAccount;
      }
    dispatch(saveUser(data, accountData._id));
  };

  return (
    <div className="Users mt-5 mb-5">
      <Row>
        <Col xs="12">
          {isPending(fetching_state) ? (
            <LoadingIndicator />
          ) : (
            <Table responsive className="table-hover ">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="text-right">Permission Level</th>
                  <th className="text-right">Verification</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {item.firstName} {item.lastName}
                      </td>
                      <td>{item.email}</td>
                      <td className="text-right">{item.roles}</td>
                      <td className="text-right">
                        {item.isVerified ? 'true' : 'false'}
                      </td>
                      <td className="text-right">
                        <ConfirmationModal
                          state={deleting_state}
                          text="Delete"
                          size="md"
                          color="danger"
                          header="Activation"
                          onClickFunc={() =>
                            deleteUser(item._id, accountData._id)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <AddNewUserModal
            state={posting_state}
            onSave={saveEmployee}
            resetState={resetAddUserState}
          />
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = ({ users, account }) => {
  const { accountData } = account;
  const { usersData, isSubmitSuccess, adduser_state, state } = users;
  return { usersData, isSubmitSuccess, adduser_state, state, accountData };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchUsers: id => {
      dispatch(fetchUsers(id));
    },
    onDeleteUser: (id, dealer) => {
      dispatch(deleteUserRequest(id, dealer));
    },
    saveNewUser: (data, id) => {
      dispatch(saveUser(data, id));
    },
    resetAddUserState: () => {
      dispatch(resetAddUserState());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null)(Users);
