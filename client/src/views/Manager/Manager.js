import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Container } from 'reactstrap';
import { fetchAccountData } from '../../reducers/account';
import ManagerCard from './components/ManagerCard';
import TabContainer from './components/TabContainer';

const Manager = ({ match, fetchAccount, accountData, user }) => {
  useEffect(() => {
    fetchAccount(user.id);
  }, [user.id]);

  return (
    <Container fluid className="animated fadeIn">
      <Row>
        <Col lg={4}>
          <ManagerCard />
        </Col>
        <Col lg={8} className="mt-3 mt-md-0">
          <TabContainer />
        </Col>
      </Row>
    </Container>
  );
};

const mapStateToProps = ({ account, auth }) => {
  const { accountData } = account;
  const { user } = auth;
  return { accountData, user };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAccount: id => {
      dispatch(fetchAccountData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Manager);
