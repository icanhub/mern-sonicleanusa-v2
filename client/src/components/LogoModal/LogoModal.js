import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCompanyData, uploadCompanyLogo } from '../../reducers/company';
import ImageUploader from 'react-images-upload';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Button,
} from 'reactstrap';
import { getUploadedImage } from '../../_helpers/helper';
import { hasSucceeded, isPending } from '../../utils/state';
import './LogoModal.scss';

const LogoModal = ({ uploadState, companyLogo, uploadLogo, id }) => {
  const [pictures, setPictures] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (hasSucceeded(uploadState)) {
      setModal(false);
    }
  }, [uploadState]);

  const onDrop = picture => {
    setPictures(picture);
  };

  const uploadImage = () => {
    var data = new FormData();
    data.append('file', pictures[0]);
    uploadLogo(data, id);
  };

  return (
    <div>
      <img
        src={
          companyLogo === undefined
            ? require('../../assets/img/logo.png')
            : getUploadedImage(companyLogo)
        }
        className="img-avatar120-3 avatarmodal__avatar"
        onClick={() => setModal(true)}
        alt="user"
      />
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <ModalHeader toggle={() => setModal(false)}>
          Upload CompanyLogo
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col>
              <ImageUploader
                withIcon={true}
                buttonText="Choose images"
                onChange={onDrop}
                imgExtension={['.jpg', '.gif', '.png', '.gif']}
                maxFileSize={5242880}
                withPreview={true}
                singleImage={true}
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button type="button" onClick={uploadImage} color="primary">
            {isPending(uploadState) ? 'Wait...' : 'Submit'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = ({ company }) => {
  const { companyData, uploadState, companyLogo } = company;
  return { companyData, uploadState, companyLogo };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCompany: () => {
      dispatch(fetchCompanyData());
    },
    uploadLogo: (data, id) => {
      dispatch(uploadCompanyLogo(data, id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LogoModal);
