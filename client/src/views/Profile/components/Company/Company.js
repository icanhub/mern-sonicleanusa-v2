import React, { useEffect } from 'react';
import { Row, Col, Form, FormGroup, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Formik, Field } from 'formik';
import FormInput from '../../../../components/common/FormInput';
import FormPhoneInput from '../../../../components/common/FormPhoneInput';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import LogoModal from '../../../../components/LogoModal/LogoModal';
import { fetchCompanyData, updateCompanyData } from '../../../../reducers/company';
import { isPending } from '../../../../utils/state';
import * as Yup from 'yup';

import './Company.scss';

const companySchema = Yup.object().shape({
  companyName: Yup.string()
    .min(2, `First name has to be at least 2 characters`)
    .required('First name is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\D*(\d\D*){10}$/, 'Must be a valid number'),
  // companyBio: Yup.string().max(250, `Bio has be max 25 characeters`),
});

const Company = ({
  state,
  companyData,
  fetchCompany,
  updateCompany,
  companyLogo,
  accountData,
}) => {
  useEffect(() => {
    fetchCompany(accountData._id);
  }, []);

  const onSubmit = data => {
    updateCompany(data, accountData._id);
  };

  return (
    <div className="Company mt-5">
      <Row>
        <Col>
          {isPending(state) ? (
            <LoadingIndicator />
          ) : (
            <Formik
              initialValues={companyData}
              validationSchema={companySchema}
              onSubmit={onSubmit}
              render={({
                handleSubmit,
                isValid,
                errors,
                touched,
                handleChange,
                handleBlur,
                values,
              }) => (
                <Form onSubmit={handleSubmit} noValidate name="simpleForm">
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Company Name*</Label>
                        <Field
                          name="companyName"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Phone Number</Label>
                        <Field
                          name="phoneNumber"
                          type={'text'}
                          component={FormPhoneInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {/* <Row>
                    <Col>
                      <FormGroup>
                        <Label>Company Bio (optional)</Label>
                        <Input
                          name="companyBio"
                          className="position-relative"
                          type="textarea"
                          id="companyBio"
                          autoComplete="given-name"
                          valid={!errors.companyBio}
                          invalid={touched.companyBio && !!errors.companyBio}
                          autoFocus={true}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="This information will be displayed on your company's dealer locator listining on www.sonicleanusa.com.(e.g. family owned business since 1975...)"
                          value={values.companyBio}
                        />
                        <h6 className="text-muted position-absolute font-weight-normal maxlength">
                          max 250 characters
                        </h6>
                        <FormFeedback className="position-absolute bio-error">
                          {errors.companyBio}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row> */}
                  <Row>
                    <Col md={6}>
                      <Label>Upload company logo (50px by 50px)</Label>
                      <LogoModal logo={companyLogo} id={accountData._id} />
                    </Col>
                  </Row>
                  <hr />
                  <Row className="float-right">
                    <Col>
                      <FormGroup>
                        <Button
                          type="submit"
                          color="success"
                          className="mr-1"
                          disabled={!isValid}
                        >
                          Submit
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              )}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = ({ company, account }) => {
  const { accountData } = account;
  const { companyData, companyLogo, state } = company;
  return { companyData, companyLogo, state, accountData };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCompany: id => {
      dispatch(fetchCompanyData(id));
    },
    updateCompany: (data, id) => {
      dispatch(updateCompanyData(data, id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Company);
