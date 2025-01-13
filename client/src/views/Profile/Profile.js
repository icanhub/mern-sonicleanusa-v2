import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Container } from 'reactstrap';
import UserCard from './components/UserCard';
import TabContainer from './components/TabContainer';
import { fetchAccountData } from '../../reducers/account';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { isPending, hasFailed } from '../../utils/state';
import NotFoundPage from './components/NotFoundPage';

const Profile = ({ fetchAccount, accountData, location, fetching_state }) => {
  useEffect(() => {
    fetchAccount(location.pathname.split('/').reverse()[0]);
  }, [location.pathname.split('/').reverse()[0]]);

  return (
    <Container fluid className="animated fadeIn">
      {isPending(fetching_state) ? (
        <LoadingIndicator />
      ) : hasFailed(fetching_state) ? (
        <NotFoundPage />
      ) : (
        <Row>
          <Col lg={4}>
            <UserCard accountData={accountData} />
          </Col>
          <Col lg={8} className="mt-md-0 mt-3">
            <TabContainer />
          </Col>
        </Row>
      )}
    </Container>
  );
};

const mapStateToProps = ({ account }) => {
  const { accountData, fetching_state } = account;
  return { accountData, fetching_state };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAccount: id => {
      dispatch(fetchAccountData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
