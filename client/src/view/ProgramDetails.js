import React, { useEffect, useState } from 'react';

import { Card, CardHeader, CardBody, Row, Col, Button } from 'reactstrap';
import { connect, useSelector } from 'react-redux';
import PDF from 'react-pdf-js-infinite';
import { fetchManagerUploadFile } from 'modules/manager';
import { isVacuumDealer, isEmployee, isDealer } from '../../_helpers/helper';
import { hasSucceeded, isPending } from 'utils/state';
import LoadingIndicator from 'components/common/LoadingIndicator';
import { getMangerUploadFile } from '../../_helpers/helper';
// import Vacuum_PDF from './Privacy-Vacuum-20210601.pdf';
// import Vacuum_PDF from './Privacy-Vacuum-20210915.pdf'
import Vacuum_PDF from './Vacuum-Retailer.pdf';
import Mohawk_PDF from './Mohawk-Karastan.pdf';

const ProgramDetails = ({ state, pdf_file, getUploadFile }) => {
  const user = useSelector(state => state.auth.user);

  const [pdf, setPdf] = useState(null);
  useEffect(() => {
    if (!isVacuumDealer(user.roles)) getUploadFile();
    // setPdf(Mohawk_PDF);
  }, []);

  // useEffect(() => {
  //   if (pdf_file.uploadfile) {
  //     setPdf(getMangerUploadFile(pdf_file.uploadfile));
  //   }
  // }, [pdf_file.uploadfile]);

  // useEffect(() => {
  //   if (pdf_file.uploadfile) {
  //     const temp = require(`../../../../public/manager/${pdf_file.uploadfile}`);
  //     setPdf(temp);
  //   }
  // }, [pdf_file.uploadfile]);

  return (
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <Col xs={6}>
            <h5 className="font-weight-normal">Program Details</h5>
          </Col>
          <Col xs={6}>
            {hasSucceeded(state) && (
                <>
                  {isVacuumDealer(user.roles) ? (
                      <a href={Vacuum_PDF} target="_blank">
                        <Button className="btn btn-sm btn-info mr-1 float-right">
                          <i className="fa fa-save"></i> Download file
                        </Button>
                      </a>
                  ) : isDealer(user.roles) && pdf_file.uploadfile !== undefined ? (
                      <a
                          href={getMangerUploadFile(pdf_file.uploadfile) || ''}
                          target="_blank"
                      >
                        <Button className="btn btn-sm btn-info mr-1 float-right">
                          <i className="fa fa-save"></i> Download file
                        </Button>
                      </a>
                  ) : isEmployee(user.roles) ? (
                      user.vacuumAccount ? (
                          <a href={Vacuum_PDF} target="_blank">
                            <Button className="btn btn-sm btn-info mr-1 float-right">
                              <i className="fa fa-save"></i> Download file
                            </Button>
                          </a>
                      ) : (
                          <a href={pdf || ''} target="_blank">
                            <Button className="btn btn-sm btn-info mr-1 float-right">
                              <i className="fa fa-save"></i> Download file
                            </Button>
                          </a>
                      )
                  ) : (
                      <>
                        <a href={Vacuum_PDF} target="_blank">
                          <Button className="btn btn-sm btn-info mr-1 float-right">
                            <i className="fa fa-save"></i> Download Vacuum file
                          </Button>
                        </a>

                        <a
                            href={Mohawk_PDF}
                            target="_blank"
                        >
                          <Button className="btn btn-sm btn-info mr-1 float-right">
                            <i className="fa fa-save"></i> Download Mohawk file
                          </Button>
                        </a>
                      </>
                  )}
                </>
            )}
          </Col>
        </CardHeader>
        <CardBody>
          {isPending(state) ? (
              <LoadingIndicator />
          ) : (
              <>
                {isVacuumDealer(user.roles) ? (
                    <Row>
                      <Col
                          className="col-xs-1 text-center"
                          style={{ overflowX: 'auto' }}
                      >
                        {!Vacuum_PDF ? null : <PDF file={Vacuum_PDF} scale={1.5} />}
                      </Col>
                    </Row>
                ) : isDealer(user.roles) ? (
                    <Row>
                      <Col
                          className="col-xs-1 text-center"
                          style={{ overflowX: 'auto' }}
                      >
                        {pdf_file.uploadfile !== undefined ? (
                            <PDF
                                file={getMangerUploadFile(pdf_file.uploadfile)}
                                // file={pdf || ''}
                                scale={1.5}
                            />
                        ) : null}
                      </Col>
                    </Row>
                ) : isEmployee(user.roles) ? (
                    user.vacuumAccount ? (
                        <Row>
                          <Col
                              className="col-xs-1 text-center"
                              style={{ overflowX: 'auto' }}
                          >
                            {!Vacuum_PDF ? null : <PDF file={Vacuum_PDF} scale={1.5} />}
                          </Col>
                        </Row>
                    ) : (
                        <Row>
                          <Col
                              className="col-xs-1 text-center"
                              style={{ overflowX: 'auto' }}
                          >
                            {pdf_file.uploadfile !== undefined ? (
                                <PDF
                                    file={getMangerUploadFile(pdf_file.uploadfile)}
                                    // file={pdf || ''}
                                    scale={1.5}
                                />
                            ) : null}
                          </Col>
                        </Row>
                    )
                ) : (
                    <>
                   {/*   <Row>
                        <Col
                            className="col-xs-1 text-center"
                            style={{ overflowX: 'auto' }}
                        >
                          {!Vacuum_PDF ? null : <PDF file={Vacuum_PDF} scale={1.5} />}
                        </Col>
                      </Row>*/}

                      <Row>
                        <Col
                            className="col-xs-1 text-center"
                            style={{ overflowX: 'auto' }}
                        >
                          {pdf_file.uploadfile !== undefined ? (
                              <PDF
                                  file={getMangerUploadFile(pdf_file.uploadfile)}
                                  // file={pdf || ''}
                                  scale={1.5}
                              />
                          ) : null}
                        </Col>
                      </Row>
                    </>
                )}
              </>
          )}
        </CardBody>
      </Card>
  );
};

const mapStateToProps = ({ manager }) => {
  const { pdf_file, state } = manager;
  return { pdf_file, state };
};

const mapDispatchToProps = dispatch => {
  return {
    getUploadFile: () => {
      dispatch(fetchManagerUploadFile());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgramDetails);
