import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import JotformEmbed from 'react-jotform-embed';
class ContactUs extends Component {
  render() {
    return <JotformEmbed src="https://form.jotform.com/81786767776178" />;
  }
}

export default ContactUs;
