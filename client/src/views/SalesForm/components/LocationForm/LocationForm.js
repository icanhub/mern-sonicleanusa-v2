import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Col,
  CustomInput,
  Row,
  Button,
} from 'reactstrap';
import AddStoreModal from '../../../../components/AddStoreModal/AddStoreModal';
import { useRadioButtons } from '../../../../components/common/useRadioButtons';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import { deleteStoreRequest } from '../../../../reducers/Stores';
import { isPending } from '../../../../utils/state';

import './LocationForm.scss';

const SelectShippingStore = ({
  data,
  onSelectStore,
  selectedStore,
  storeLoading,
  id,
}) => {
  const dispatch = useDispatch();
  const deleting_state = useSelector(state => state.stores.deleting_state);

  const [storeValue, storeInputProps] = useRadioButtons('store', value => {
    onSelectStore(value);
  });

  const deleteStore = (id, dealer) => {
    dispatch(deleteStoreRequest(id, dealer));
  };

  return (
    <div className="animated fadeIn LocationForm mt-3">
      <Card>
        <CardHeader className="text-left">
          <i className="icon-note"></i>
          <strong>Select Store Location</strong>
          <AddStoreModal id={id} />
        </CardHeader>
        <CardBody className="text-left">
          <Row>
            <Col>
              {isPending(storeLoading) ? (
                <LoadingIndicator />
              ) : (
                data &&
                data.map((item, index) => {
                  return (
                    <div className="d-flex align-items-center ">
                      <CustomInput
                        id={item._id}
                        label={`${item.name}, ${item.address1} ${
                          item.address2 ? item.address2 : ''
                        }, ${item.city}, ${item.us_state}, ${item.zipcode}`}
                        value={item._id}
                        checked={selectedStore === item._id}
                        className="mt-3"
                        {...storeInputProps}
                        key={index}
                      />
                      <AddStoreModal
                        type="EDIT"
                        initialData={item}
                        id={id}
                        btnSize="sm"
                        className="mt-3 ml-3"
                      />
                      <ConfirmationModal
                        state={deleting_state}
                        text="Delete"
                        size="sm"
                        color="danger"
                        header="DELETE"
                        className="mt-3"
                        onClickFunc={() => deleteStore(item._id, id)}
                      />
                    </div>
                  );
                })
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default SelectShippingStore;
