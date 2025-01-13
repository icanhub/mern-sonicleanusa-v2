import React from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  Spinner,
} from 'reactstrap';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import AvatarModal from '../../../../components/AvatarModal/AvatarModal';

import './UserCard.scss';

const UserCard = ({ accountData }) => {
  return (
    <div className="UserCard text-center">
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
          <Row className="mt-4 mb-3">
            <Col>
              <ListGroup>
                <ListGroupItem className="d-flex justify-content-between align-items-center">
                  <h5>Account Level</h5>
                  {accountData.roles === 'vacuum-dealer' ? (
                    <h5 className="text-muted font-weight-normal">
                      Vacuum-Dealer
                    </h5>
                  ) : accountData.roles === 'dealer' ? (
                    <img
                      src={
                        accountData.mohawkBrand === 'Mohawk'
                          ? require('../../../../assets/img/mohawk.png')
                          : require('../../../../assets/img/karastan.png')
                      }
                      alt="accountLevel"
                      className="accountLogo"
                    />
                  ) : accountData.roles === 'employee' ? (
                    accountData.vacuumAccount ? (
                      <h5 className="text-muted font-weight-normal">
                        Vacuum-Dealer
                      </h5>
                    ) : (
                      <img
                        src={
                          accountData.mohawkBrand === 'Mohawk'
                            ? require('../../../../assets/img/mohawk.png')
                            : require('../../../../assets/img/karastan.png')
                        }
                        alt="accountLevel"
                        className="accountLogo"
                      />
                    )
                  ) : null}
                </ListGroupItem>
                {accountData.roles === 'dealer' ? (
                  <ListGroupItem className="d-flex justify-content-between">
                    <h5>Mohawk Account</h5>
                    <h5 className="text-muted font-weight-normal">
                      {accountData.mohawkAccount}
                    </h5>
                  </ListGroupItem>
                ) : accountData.roles === 'vacuum-dealer' ? (
                  <ListGroupItem className="d-flex justify-content-between">
                    <h5>Vacuum Account</h5>
                    <h5 className="text-muted font-weight-normal">
                      {accountData.vacuumAccount}
                    </h5>
                  </ListGroupItem>
                ) : accountData.roles === 'employee' ? (
                  <ListGroupItem className="d-flex justify-content-between">
                    {accountData.vacuumAccount ? (
                      <h5>Vacuum Account</h5>
                    ) : (
                      <h5>Mohawk Account</h5>
                    )}
                    {accountData.vacuumAccount ? (
                      <h5 className="text-muted font-weight-normal">
                        {accountData.vacuumAccount}
                      </h5>
                    ) : (
                      <h5 className="text-muted font-weight-normal">
                        {accountData.mohawkAccount}
                      </h5>
                    )}
                  </ListGroupItem>
                ) : null}
                <ListGroupItem className="d-flex justify-content-between">
                  <h5>Dealer Since</h5>
                  <h5 className="text-muted font-weight-normal">
                    {moment(accountData.created)
                      .tz('America/New_York')
                      .format('YYYY-MM-DD')}
                  </h5>
                </ListGroupItem>
                <ListGroupItem className="d-flex justify-content-between">
                  <h5>Orders Placed</h5>
                  <h5 className="text-muted font-weight-normal">
                    {accountData.ordersCount}
                  </h5>
                </ListGroupItem>
                <ListGroupItem className="d-flex justify-content-between">
                  <h5>Store Locations</h5>
                  <h5 className="text-muted font-weight-normal">
                    {accountData.storesCount}
                  </h5>
                </ListGroupItem>
              </ListGroup>
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
