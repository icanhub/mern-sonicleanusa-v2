import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment-timezone';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  ButtonToolbar,
  ButtonGroup,
} from 'reactstrap';

const AmountChart = ({ orderhistory }) => {
  const [radioSelected, setRadioSelected] = useState(2);
  const [labels, setLabels] = useState();
  const [data, setData] = useState();
  const [max, setMax] = useState();

  useEffect(() => {
    if (radioSelected === 1) {
      dayData();
    } else if (radioSelected === 2) {
      monthData();
    } else if (radioSelected === 3) {
      yearData();
    }
    return () => {};
  }, [radioSelected]);

  const dayData = () => {
    let timeName = [];
    for (var i = 0; i < 24; i++) {
      timeName.push(`${i}:00`);
    }
    setLabels(timeName);

    let todayOrderinfo = orderhistory.filter(item => {
      return (
        moment(item.created)
          .tz('Australia/Sydney')
          .format('YYYY-MM-DD') ===
        moment(new Date())
          .tz('Australia/Sydney')
          .format('YYYY-MM-DD')
      );
    });

    let data = [];
    for (var i = 0; i < 24; i++) {
      data[i] = 0;
      let sum = 0;
      for (var j = 0; j < todayOrderinfo.length; j++) {
        if (
          moment(todayOrderinfo[j].created)
            .tz('Australia/Sydney')
            .format('YYYY-MM-DD HH:00') ===
          `${moment(new Date())
            .tz('Australia/Sydney')
            .format('YYYY-MM-DD')} ${i < 10 ? '0' + i : i}:00`
        ) {
          sum += parseFloat(todayOrderinfo[j].sub_total);
          data[i] = sum;
        }
      }
    }
    setMax(Math.max(...data));
    setData(data);
  };

  const monthData = () => {
    let dayName = [];
    for (var i = 1; i <= moment(new Date(), 'YYYY-MM').daysInMonth(); i++) {
      dayName.push(i);
    }
    setLabels(dayName);

    let monthOrderinfo = orderhistory.filter(item => {
      return (
        moment(item.created)
          .tz('Australia/Sydney')
          .format('YYYY-MM') ===
        moment(new Date())
          .tz('Australia/Sydney')
          .format('YYYY-MM')
      );
    });

    let data = [];
    for (i = 0; i <= moment(new Date(), 'YYYY-MM').daysInMonth(); i++) {
      data[i] = 0;
      let sum = 0;

      for (var j = 0; j < monthOrderinfo.length; j++) {
        if (
          moment(monthOrderinfo[j].created)
            .tz('Australia/Sydney')
            .format('YYYY-MM-DD') ===
          `${moment(new Date())
            .tz('Australia/Sydney')
            .format('YYYY-MM')}-${i < 10 ? '0' + i : i}`
        ) {
          sum += parseFloat(monthOrderinfo[j].sub_total);
          data[i] = sum;
        }
      }
    }
    setMax(Math.max(...data));
    setData(data);
  };

  const yearData = () => {
    let monthName = [];
    const monthShortName = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    for (var i = 0; i < 12; i++) {
      monthName.push(monthShortName[i]);
    }
    setLabels(monthName);
    let yearOrderinfo = orderhistory.filter(item => {
      return (
        moment(item.created)
          .tz('Australia/Sydney')
          .format('YYYY') ===
        moment(new Date())
          .tz('Australia/Sydney')
          .format('YYYY')
      );
    });

    let data = [];
    for (i = 0; i < 12; i++) {
      data[i] = 0;
      let sum = 0;

      for (var j = 0; j < yearOrderinfo.length; j++) {
        if (
          moment(yearOrderinfo[j].created)
            .tz('Australia/Sydney')
            .format('YYYY-MM') ===
          `${moment(new Date())
            .tz('Australia/Sydney')
            .format('YYYY')}-${i + 1 < 10 ? '0' + (i + 1) : i + 1}`
        ) {
          sum += parseFloat(yearOrderinfo[j].sub_total);
          data[i] = sum;
        }
      }
    }
    setMax(Math.max(...data));
    setData(data);
  };

  const main_chart = {
    labels: labels,
    datasets: [
      {
        label: 'Amounts(USD)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
        data: data,
      },
    ],
  };

  const mainChartOpts = {
    tooltips: {
      enabled: false,
      custom: CustomTooltips,
      intersect: true,
      mode: 'index',
      position: 'nearest',
      callbacks: {
        labelColor: function(tooltipItem, chart) {
          return {
            backgroundColor:
              chart.data.datasets[tooltipItem.datasetIndex].borderColor,
          };
        },
      },
    },
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            drawOnChartArea: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 5,
            stepSize: Math.ceil(max / 5),
            max: max,
          },
        },
      ],
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <Row>
      <Col>
        <Card>
          <CardBody>
            <Row>
              <Col sm="5">
                <CardTitle className="mb-0 font-weight-bold">
                  <h5>Sales</h5>
                </CardTitle>
                <div className="small text-muted">
                  {radioSelected === 1
                    ? moment(new Date())
                        .tz('Australia/Sydney')
                        .format('YYYY-MM-DD')
                    : radioSelected === 2
                    ? moment(new Date())
                        .tz('Australia/Sydney')
                        .format('MMMM, YYYY')
                    : moment(new Date())
                        .tz('Australia/Sydney')
                        .format('YYYY')}
                </div>
              </Col>
              <Col sm="7" className="d-none d-sm-inline-block">
                <ButtonToolbar
                  className="float-right"
                  aria-label="Toolbar with button groups"
                >
                  <ButtonGroup className="mr-3" aria-label="First group">
                    <Button
                      color="outline-secondary"
                      onClick={() => setRadioSelected(1)}
                      active={radioSelected === 1}
                    >
                      Day
                    </Button>
                    <Button
                      color="outline-secondary"
                      onClick={() => setRadioSelected(2)}
                      active={radioSelected === 2}
                    >
                      Month
                    </Button>
                    <Button
                      color="outline-secondary"
                      onClick={() => setRadioSelected(3)}
                      active={radioSelected === 3}
                    >
                      Year
                    </Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </Col>
            </Row>
            <div
              className="chart-wrapper"
              style={{ height: 300 + 'px', marginTop: 40 + 'px' }}
            >
              <Bar data={main_chart} options={mainChartOpts} height={300} />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AmountChart;
