import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { connect } from 'react-redux';
import AvatarModal from '../../../../components/AvatarModal/AvatarModal';
import './ManagerCard.scss';

const UserCard = ({ accountData }) => {
  return (
    <div className="managercard text-center">
      <Card>
        <CardBody className="position-relative">
          <span className="badge p-2 badge-danger position-absolute text-capitalize">
            {accountData.roles}
          </span>
          <Row>
            <Col>
              <AvatarModal />
            </Col>
          </Row>
          <Row>
            <Col>
              <h2>
                {accountData.firstName} {accountData.lastName}
              </h2>
              <h5 className="text-muted font-weight-normal">
                {accountData.companyName}
              </h5>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

const mapStateToProps = ({ account }) => {
  const { accountData, state } = account;
  return { accountData, state };
};

export default connect(mapStateToProps, null)(UserCard);
