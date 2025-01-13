import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchAccountData, uploadAccountPhto } from '../../reducers/account';
import Avatar from 'react-avatar-edit';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Label,
  Button,
} from 'reactstrap';
import { hasSucceeded, isPending } from '../../utils/state';
import { getUploadedImage } from '../../_helpers/helper';
import './AvatarModal.scss';

const AvatarModal = ({
  fetchAccount,
  accountData,
  uploadState,
  userPhoto,
  uploadPhto,
  match,
}) => {
  const [preview, setPreview] = useState(null);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    // fetchAccount()
    if (hasSucceeded(uploadState)) {
      setModal(false);
    }
  }, [uploadState]);

  const onCrop = preview => {
    setPreview(preview);
  };

  const onClose = () => {
    setPreview(null);
  };

  const onBeforeFileLoad = elem => {
    if (elem.target.files[0].size > 71680) {
      alert('File is too big!');
      elem.target.value = '';
    }
  };

  const uploadImage = () => {
    uploadPhto(preview, accountData._id);
  };

  return (
    <div>
      <img
        src={
          userPhoto === undefined
            ? require('../../assets/img/emptylogo.png')
            : getUploadedImage(userPhoto)
        }
        className="img-avatar120 avatarmodal__avatar"
        onClick={() => setModal(true)}
        alt="user"
      />
      <Modal
        isOpen={modal}
        className={'modal-primary modal-md'}
        toggle={() => setModal(false)}
      >
        <ModalHeader toggle={() => setModal(false)}>Upload Avatar</ModalHeader>
        <ModalBody>
          <Row>
            <Col>
              <Label>Upload Profile Picture (50px by 50px)</Label>
              <Avatar
                width={'100%'}
                height={200}
                onCrop={onCrop}
                onClose={onClose}
                onBeforeFileLoad={onBeforeFileLoad}
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="primary" onClick={uploadImage}>
            {isPending(uploadState) ? 'Wait...' : 'Submit'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = ({ account }) => {
  const { accountData, uploadState, userPhoto } = account;
  return { accountData, uploadState, userPhoto };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAccount: () => {
      dispatch(fetchAccountData());
    },
    uploadPhto: (data, id) => {
      dispatch(uploadAccountPhto(data, id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AvatarModal);
