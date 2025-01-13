import React from 'react';
import { FormFeedback } from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import PropTypes from 'prop-types';

const FormSelect = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched },
  options,
  ...props
}) => (
    <div>
      <Select
        // className={classNames(this.state.mohawk_error ? 'error-select' : '')}
        name={field.name}
        id={field.name}
        options={options}
        value={
          options ? options.find(option => option.value === field.value) : ''
        }
        onChange={option => setFieldValue(field.name, option.value)}
        onBlur={field.onBlur}
        defaultValue={{ label: 'Select Dept', value: '' }}
      />
      {touched[field.name] && errors[field.name] && (
        <FormFeedback>{errors[field.name]}</FormFeedback>
      )}
    </div>
  );

FormSelect.propTypes = {
  meta: PropTypes.object,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default FormSelect;
