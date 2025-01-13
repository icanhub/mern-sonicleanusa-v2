import React, { useEffect, useState } from 'react';

import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';

import moment from 'moment-timezone';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
// import './react_dates_overrides.css';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { formatMoney } from '../../_helpers/helper';

const options = [
  { value: 'ALL', label: 'ALL orders' },
  { value: 'DS', label: 'DS orders' },
  { value: 'DSS', label: 'DSS orders' },
  { value: 'INV', label: 'INV orders' },
  { value: 'MKT', label: 'MKT orders' },
  { value: 'DEM', label: 'DEM orders' },
];

const ALLProducts = [
  'sfc-display-kar',
  'sfc-display-mhk',
  'DEMO-KSC7500',
  'DEMO-SFC7000',
  'DEMO-HH0800',
  'SUF-0520-7',
  'SFP-0100',
  'SHF-0800',
  'KSC-7500',
  'SFC-7000-MHK',
  'STV-1',
  'HH-0800',
  'SUF-0520-7-4',
  'SFP-0100-4',
  'SHF-0800-4',
];

const DSProducts = [
  'KSC-7500',
  'SFC-7000-MHK',
  'STV-1',
  'HH-0800',
  'SUF-0520-7',
  'SFP-0100',
  'SHF-0800',
];
const INVProducts = [
  'KSC-7500',
  'SFC-7000-MHK',
  'STV-1',
  'HH-0800',
  'SUF-0520-7-4',
  'SFP-0100-4',
  'SHF-0800-4',
];
const MKTProducts = ['sfc-display-kar', 'sfc-display-mhk'];
const DEMProducts = ['DEMO-KSC7500', 'DEMO-SFC7000', 'DEMO-HH0800'];

const OrderFilterTable = ({ orderhistory }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState();
  const [orderType, setOrderType] = useState(options[0]);
  const [pList, setPList] = useState({});

  useEffect(() => {
    if (orderType.value === 'ALL') {
      filterProduction(orderType, ALLProducts);
    } else if (orderType.value === 'INV') {
      filterProduction(orderType, INVProducts);
    } else if (orderType.value === 'DEM') {
      filterProduction(orderType, DEMProducts);
    } else if (orderType.value === 'MKT') {
      filterProduction(orderType, MKTProducts);
    } else if (orderType.value === 'DS' || orderType.value === 'DSS') {
      filterProduction(orderType, DSProducts);
    }
  }, [orderhistory, orderType, startDate, endDate]);

  const filterProduction = (ordertype, Products) => {
    let filterArray = orderhistory;

    if (startDate !== null && endDate !== null) {
      var s_date = moment(startDate)
        .tz('Australia/Sydney')
        .format('YYYY-MM-DD');
      var e_date = moment(endDate)
        .tz('Australia/Sydney')
        .format('YYYY-MM-DD');

      filterArray = orderhistory.filter(order => {
        var createdDate = moment(order.created)
          .tz('Australia/Sydney')
          .format('YYYY-MM-DD');
        return moment(createdDate).isBetween(s_date, e_date, null, '[]');
      });
    }
    let m = filterArray.filter(order => {
      if (orderType.value === 'ALL') {
        return order.cust_ref !== '';
      } else
        return (
          order.cust_ref && order.cust_ref.split('.')[1] === orderType.value
        );
    });

    let p_obj = {};
    for (let p of Products) {
      var t = m.map(order => order.items.filter(item => item.item === p));
      var cleanArray = t.filter(x => x.length > 0);
      var newArr = [];
      for (var i = 0; i < cleanArray.length; i++) {
        newArr = newArr.concat(cleanArray[i]);
      }
      var totalUnits = newArr.reduce((acc, p) => acc + p.quantity, 0);
      var totalPrice = newArr.reduce((acc, p) => acc + p.sub_total, 0);
      let temp = {};
      temp['totalUnits'] = totalUnits;
      temp['totalCosts'] = Number(totalPrice).toFixed(2);
      p_obj[p] = temp;
    }
    setPList(p_obj);
  };

  const onChangeOrderType = value => {
    setOrderType(value);
  };

  return (
    <Row>
      <Col>
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>
                <DateRangePicker
                  startDate={startDate}
                  startDateId="startDate"
                  endDate={endDate}
                  endDateId="endDate"
                  onDatesChange={({ startDate, endDate }) => {
                    setStartDate(startDate);
                    setEndDate(endDate);
                  }}
                  focusedInput={focusedInput}
                  onFocusChange={focusedInput => setFocusedInput(focusedInput)}
                  orientation={'horizontal'}
                  openDirection={'down'}
                  isOutsideRange={() => false}
                />
              </Col>
              <Col lg={3} md={3} sm={12}>
                <Select
                  name="form-field-name2"
                  value={orderType}
                  options={options}
                  onChange={onChangeOrderType}
                />
              </Col>
            </Row>
          </CardHeader>

          <CardBody>
            <Table responsive>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {orderType.value === 'INV' &&
                  INVProducts.map(item => {
                    return (
                      <tr>
                        <td>{item}</td>
                        <td>{pList[item] && pList[item].totalUnits}</td>
                        <td>
                          ${formatMoney(pList[item] && pList[item].totalCosts)}
                        </td>
                      </tr>
                    );
                  })}
                {orderType.value === 'ALL' &&
                  ALLProducts.map(item => {
                    return (
                      <tr>
                        <td>{item}</td>
                        <td>{pList[item] && pList[item].totalUnits}</td>
                        <td>
                          ${formatMoney(pList[item] && pList[item].totalCosts)}
                        </td>
                      </tr>
                    );
                  })}
                {orderType.value === 'DEM' &&
                  DEMProducts.map(item => {
                    return (
                      <tr>
                        <td>{item}</td>
                        <td>{pList[item] && pList[item].totalUnits}</td>
                        <td>
                          ${formatMoney(pList[item] && pList[item].totalCosts)}
                        </td>
                      </tr>
                    );
                  })}
                {orderType.value === 'MKT' &&
                  MKTProducts.map(item => {
                    return (
                      <tr>
                        <td>{item}</td>
                        <td>{pList[item] && pList[item].totalUnits}</td>
                        <td>
                          ${formatMoney(pList[item] && pList[item].totalCosts)}
                        </td>
                      </tr>
                    );
                  })}
                {(orderType.value === 'DS' || orderType.value === 'DSS') &&
                  DSProducts.map(item => {
                    return (
                      <tr>
                        <td>{item}</td>
                        <td>{pList[item] && pList[item].totalUnits}</td>
                        <td>
                          ${formatMoney(pList[item] && pList[item].totalCosts)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default OrderFilterTable;
