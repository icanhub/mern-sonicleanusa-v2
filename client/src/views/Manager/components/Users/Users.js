import React, { useEffect } from 'react';
import { Row, Col, Card, CardHeader, CardBody, Table } from 'reactstrap';
import { connect } from 'react-redux';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import AddNewUserModal from '../../../../components/AddNewUserModal/AddNewUserModal';
import {
  fetchSonicleanUsersList,
  addSonicleanUser,
  delSonicleanUser,
} from '../../../../reducers/manager';
import { isPending } from '../../../../utils/state';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';

import './Users.scss';

const Users = ({
  fetchSonicleanUsers,
  addNewSonicleanUser,
  sonicleanusers,
  onDeleteUser,
  state,
}) => {
  useEffect(() => {
    fetchSonicleanUsers();
  }, []);

  const deleteUser = id => {
    onDeleteUser(id);
  };

  const newSonicleanUser = values => {
    addNewSonicleanUser(values);
  };

  return (
    <div className="Users mt-5 mb-5">
      <Row>
        <Col xs="12">
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="font-weight-normal">User Management</h5>
              <AddNewUserModal state={state} onSave={newSonicleanUser} />
            </CardHeader>
            <CardBody>
              {isPending(state) ? (
                <LoadingIndicator />
              ) : (
                <Table responsive className="table-hover ">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="text-right">Permission Level</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonicleanusers &&
                      sonicleanusers.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {item.firstName} {item.lastName}
                            </td>
                            <td>{item.email}</td>
                            <td className="text-right">{item.roles}</td>
                            <td className="text-right">
                              <ConfirmationModal
                                text="Delete"
                                size="md"
                                color="danger"
                                header="Activation"
                                onClickFunc={() => deleteUser(item._id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = ({ manager }) => {
  const { sonicleanusers, state } = manager;
  return { sonicleanusers, state };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSonicleanUsers: id => {
      dispatch(fetchSonicleanUsersList(id));
    },
    addNewSonicleanUser: data => {
      dispatch(addSonicleanUser(data));
    },
    onDeleteUser: id => {
      dispatch(delSonicleanUser(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null)(Users);
