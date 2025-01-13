import React from 'react';
import { FormFeedback, Input } from 'reactstrap';

const FormFileUpload = ({
  form: { touched, errors, setFieldValue },
  field,
}) => (
  <div>
    <Input
      invalid={!!(touched[field.name] && errors[field.name])}
      name={field.name}
      type="file"
      accept="pdf/*"
      onChange={e => setFieldValue(field.name, e.target.files[0])}
    />
    {touched[field.name] && errors[field.name] && (
      <FormFeedback>{errors[field.name]}</FormFeedback>
    )}
  </div>
);

export default FormFileUpload;
