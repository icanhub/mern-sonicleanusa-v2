import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import AddStoreModal from '../../../../components/AddStoreModal/AddStoreModal';
import { fetchStores, deleteStoreRequest } from '../../../../reducers/Stores';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import { isPending } from '../../../../utils/state';

import './StoreLocations.scss';

const StoreLocations = () => {
  const dispatch = useDispatch();
  const fetching_state = useSelector(state => state.stores.fetching_state);
  const deleting_state = useSelector(state => state.stores.deleting_state);
  const accountData = useSelector(state => state.account.accountData);
  const storesData = useSelector(state => state.stores.storesData);

  useEffect(() => {
    if (accountData.roles === 'employee') {
      dispatch(fetchStores(accountData._adminId));
    } else if (
      accountData.roles === 'dealer' ||
      accountData.roles === 'vacuum-dealer'
    ) {
      dispatch(fetchStores(accountData._id));
    }
  }, []);

  const deleteStore = (id, dealer) => {
    dispatch(deleteStoreRequest(id, dealer));
  };

  return (
    <div className="StoreLocations mt-4">
      <Row>
        <Col xs="12">
          {isPending(fetching_state) ? (
            <LoadingIndicator />
          ) : (
            <Table responsive className="table-hover table-striped ">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th className="text-right">Address 1</th>
                  <th className="text-right">Address 2</th>
                  <th className="text-right">City</th>
                  <th className="text-right">State</th>
                  <th className="text-right">ZipCode</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {storesData.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="text-left">{item.name}</td>
                      <td className="text-right">{item.address1}</td>
                      <td className="text-right">{item.address2}</td>
                      <td className="text-right">{item.city}</td>
                      <td className="text-right">{item.us_state}</td>
                      <td className="text-right">{item.zipcode}</td>
                      <td className="text-right">
                        <AddStoreModal
                          type="EDIT"
                          initialData={item}
                          id={
                            accountData.roles === 'employee'
                              ? accountData._adminId
                              : accountData._id
                          }
                        />
                        <ConfirmationModal
                          state={deleting_state}
                          text="Delete"
                          size="md"
                          color="danger"
                          header="DELETE"
                          onClickFunc={() =>
                            deleteStore(
                              item._id,
                              accountData.roles === 'employee'
                                ? accountData._adminId
                                : accountData._id
                            )
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
          <AddStoreModal
            id={
              accountData.roles === 'employee'
                ? accountData._adminId
                : accountData._id
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default StoreLocations;
