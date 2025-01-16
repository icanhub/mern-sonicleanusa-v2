import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  Button,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "reactstrap";
import creditCardType from "credit-card-type";
import Cards from "react-credit-cards";
// import {
//   formatCreditCardNumber,
//   formatCVC,
//   formatExpirationDate,
// } from "./cardUtils";
import { Form, Field } from "react-final-form";
import { saveCard, resetPostingState } from "../../reducers/cards";
import { isPending, hasSucceeded, hasFailed } from "../../utils/state";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import "react-credit-cards/es/styles-compiled.css";
import { useMediaQuery } from "react-responsive";
import "../AddPaymentMethodModal/AddPaymentMethodModal.scss";

const Default = ({ children }) => {
  const isNotMobile = useMediaQuery({ minWidth: 768 });
  return isNotMobile ? children : null;
};

const initialValues = {
  number: "",
  expiry: "",
  cvc: "",
  name: "",
};

const AddPaymentMethodModal = ({ id }) => {
  const [errorMessage, setErrors] = useState("");
  const [modal, setModal] = useState(false);

  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();

  const posting_state = useSelector((state) => state.card.posting_state);
  const error = useSelector((state) => state.card.error);

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
        borderRadius: "50px",
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  useEffect(() => {
    if (hasSucceeded(posting_state)) {
      setModal(false);
    } else if (hasFailed(posting_state)) {
      setErrors(error);
      setTimeout(() => {
        dispatch(resetPostingState());
      }, 3000);
    }
  }, [posting_state]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onSubmit = async (values) => {
    setErrors("");

    // if (values.cvc === '') {
    //   setErrors('CVC is required');
    //   return;
    // } else if (values.expiry === '') {
    //   setErrors('Expire date is required');
    //   return;
    // } else if (values.name === '') {
    //   setErrors('Name is required');
    //   return;
    // } else if (values.number === '') {
    //   setErrors('Card number is required');
    //   return;
    // } else if (!validateCardType(values.number)) {
    //   setErrors('Invalid Card number');
    //   return;
    // } else if (errorMessage === '') {
    //   // await sleep(300);
    //   const data = {
    //     cardnumber: values.number,
    //     cvvcode: values.cvc,
    //     holdername: values.name,
    //     expiredatemonth: values.expiry.substr(0, 2),
    //     expiredateyear: values.expiry.substr(3, 6),
    //   };
    // }

    const cardNumberElement = elements.getElement(CardNumberElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberElement,
    });
    if (error) {
      setErrors(error.message);
    } else {
      await dispatch(saveCard(paymentMethod.id, id));
    }
  };

  const validateCardType = (number) => {
    var cardtype = creditCardType(number);
    if (cardtype.length > 0) return true;
    else if (cardtype.length === 0) return false;
  };

  return (
    <div className="animated fadeIn mt-3 AddLocationModal">
      <Button
        size="md"
        className="btn-success btn-brand mr-1 mb-1 float-right"
        onClick={() => {
          setErrors("");
          setModal(true);
        }}
      >
        <i className="fa fa-plus"></i>
        <Default>
          <span>Add New Card</span>
        </Default>
      </Button>
      {/* <div className="card-yogesh">
        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
      </div> */}
      <Modal isOpen={modal} className="modal-primary">
        <ModalHeader>Add Payment Method</ModalHeader>
        <Form
          onSubmit={onSubmit}
          initialValues={initialValues}
          render={({ handleSubmit, values, active }) => {
            return (
              <form onSubmit={handleSubmit}>
                <ModalBody>
                  <Row>
                    <Col>
                      <Cards
                        number={values.number || ""}
                        name={values.name || ''}
                        expiry={values.expiry || ""}
                        cvc={values.cvc || ""}
                        focused={active}
                      />
                    </Col>
                  </Row>
                  {/* <Row className="mt-4">
                    <Col>
                      <Field
                        name="number"
                        component="input"
                        className="form-control"
                        type="text"
                        pattern="[\d| ]{16,22}"
                        placeholder="Card Number"
                        format={formatCreditCardNumber}
                      />
                    </Col>
                  </Row> */}

                  {/* <Row className="mt-3">
                    <Col>
                      <Field
                        name="name"
                        component="input"
                        className="form-control"
                        type="text"
                        placeholder="Name"
                      />
                    </Col>
                  </Row> */}
                  {/* <Row className="mt-3">
                    <Col>
                      <Field
                        name="expiry"
                        component="input"
                        className="form-control"
                        type="text"
                        pattern="\d\d/\d\d"
                        placeholder="Valid Thru"
                        format={formatExpirationDate}
                      />
                    </Col>
                    <Col className="pl-0">
                      <Field
                        name="cvc"
                        component="input"
                        type="text"
                        className="form-control"
                        pattern="\d{3,4}"
                        placeholder="CVC"
                        format={formatCVC}
                      />
                    </Col>
                  </Row> */}
                  <Row className="mt-5">
                    <Col>
                      <div className="error-message">{errorMessage}</div>
                    </Col>
                  </Row>
                  <div>
                    <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                    <div className="col-md-6">
                      <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={isPending(posting_state)}
                  >
                    {isPending(posting_state) ? "Wait..." : "Submit"}
                  </Button>
                  <Button
                    color="danger"
                    onClick={() => setModal(false)}
                    disabled={isPending(posting_state)}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </form>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default withRouter(AddPaymentMethodModal);
