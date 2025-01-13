import React, { useEffect, useState } from 'react';

import { Row, Col, Card, CardBody } from 'reactstrap';
import { formatMoney } from '../../_helpers/helper';
import moment from 'moment-timezone';

const Statistics = ({ orderhistory }) => {
  const [todayOrders, setTodayOrders] = useState();
  const [todaySales, setTodaySales] = useState();
  const [totalOrders, setTotalOrders] = useState();
  const [totalSales, setTotalSales] = useState();

  useEffect(() => {
    setTotalOrders(orderhistory.length);
    setTotalSales(
      orderhistory.reduce(function(a, b) {
        return Number(a) + Number(b['sub_total']);
      }, 0)
    );
    let todayOrderinfo = orderhistory.filter(item => {
      return (
        moment(item.created)
          .tz('America/New_York')
          .format('YYYY-MM-DD') ===
        moment(new Date())
          .tz('America/New_York')
          .format('YYYY-MM-DD')
      );
    });

    setTodayOrders(todayOrderinfo.length);
    setTodaySales(
      todayOrderinfo.reduce(function(a, b) {
        return Number(a) + Number(b['sub_total']);
      }, 0)
    );

    return () => {};
  }, [orderhistory]);

  return (
    <Row className="mt-4">
      <Col xs="12" sm="6" lg="3">
        <Card className="text-white bg-primary">
          <CardBody>
            <h6>Today's Orders</h6>
            <h4>{todayOrders}</h4>
          </CardBody>
        </Card>
      </Col>
      <Col xs="12" sm="6" lg="3">
        <Card className="text-white bg-success">
          <CardBody>
            <h6>Today's Sales</h6>
            <h4>${formatMoney(todaySales)}</h4>
          </CardBody>
        </Card>
      </Col>
      <Col xs="12" sm="6" lg="3">
        <Card className="text-white bg-warning">
          <CardBody>
            <h6>Total Orders</h6>
            <h4>{totalOrders}</h4>
          </CardBody>
        </Card>
      </Col>
      <Col xs="12" sm="6" lg="3">
        <Card className="text-white bg-danger">
          <CardBody>
            <h6>Total Sales</h6>
            <h4>${formatMoney(totalSales)}</h4>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Statistics;
