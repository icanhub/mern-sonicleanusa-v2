import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NotFoundPage.scss';
const NotFoundPage = () => {
  return (
    <div className="notfoundpage">
      <Container>
        <Row className="flex-row align-items-center justify-content-center ">
          <Col md="5">
            <div className="clearfix">
              <h1 className="float-left display-3 mr-4">404</h1>
              <h4 className="pt-3">Oops! You're lost.</h4>
              <p className="text-muted float-left">
                The page you are looking for was not found.
              </p>
            </div>
            <p style={{ textAlign: 'center' }}>
              <Link to="/">Go to Dashboard </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFoundPage;
