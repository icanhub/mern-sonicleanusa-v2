import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from 'reactstrap';

import { isPending } from '../../utils/state';

const PrivacyUploadModal = ({
  state,
  error,
  uploadFile,
  orderId,
  type,
  className,
}) => {
  const [modal, setModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loaded, setLoaded] = useState(0);

  const onClickHandler = () => {
    let data = new FormData();
    data.append('file', selectedFile);
    uploadFile(data);
    setModal(false);
  };

  const onChangeHandler = event => {
    setSelectedFile(event.target.files[0]);
    setLoaded(0);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        color="danger"
        onClick={() => setModal(true)}
      >
        <i className="fa fa-upload"></i> Upload File
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <ModalHeader>File Upload</ModalHeader>
        <ModalBody>
          <p>
            Please select <strong>a {type} File</strong>.
          </p>
          <Input
            type="file"
            name="file"
            accept={`.${type}`}
            onChange={onChangeHandler}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={onClickHandler}
            disabled={isPending(state)}
          >
            {isPending(state) ? 'Wait...' : 'Submit'}
          </Button>
          <Button
            color="danger"
            disabled={isPending(state)}
            onClick={() => setModal(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default withRouter(PrivacyUploadModal);
