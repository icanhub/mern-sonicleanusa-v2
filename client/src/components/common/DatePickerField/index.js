import React from 'react';
import DatePicker from 'react-datepicker';

const DatePickerField = ({ name, value, onChange, onBlur, className, placeholder }) => {
  return (
    <DatePicker
      name={name}
      autoComplete={name}
      selected={(value && new Date(value)) || null}
      onChange={val => {
        onChange(name, val);
      }}
      onBlur={onBlur}
      placeholderText={placeholder}
      className={className}
      required
    />
  );
};

export default DatePickerField;