import React from 'react';

import { Row, Col, Card, CardBody, CardTitle } from 'reactstrap';

const DealerSession = () => {
  return (
    <div>
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CardTitle className="mb-0 font-weight-bold">
                <h5>Dealer Sessions</h5>
              </CardTitle>
              <Row>
                <Col sm="3">
                  <div className="callout callout-info">
                    <small className="text-muted">Today</small>
                    <br />
                    <strong className="h4">9,123</strong>
                  </div>
                </Col>
                <Col sm="3">
                  <div className="callout callout-danger">
                    <small className="text-muted">This Week</small>
                    <br />
                    <strong className="h4">22,643</strong>
                  </div>
                </Col>
                <Col sm="3">
                  <div className="callout callout-info">
                    <small className="text-muted">This Month</small>
                    <br />
                    <strong className="h4">22,643</strong>
                  </div>
                </Col>
                <Col sm="3">
                  <div className="callout callout-danger">
                    <small className="text-muted">This Year</small>
                    <br />
                    <strong className="h4">22,643</strong>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DealerSession;
