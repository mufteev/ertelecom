import { useState } from 'react';

function InputValidate({ id, label, value, validate, onChange, type = 'text', min, max }) {
  const [error, setError] = useState(undefined);

  let classInput = 'form-control';
  let memberMin = '';
  let memberMax = '';

  if (error === null) classInput += ' is-valid';
  if (!!error) classInput += ' is-invalid';
  if (type === 'number') {
    memberMin = min;
    memberMax = max;
  }

  function handleValidate(e) {
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
    if (typeof validate === 'function') {
      setError(validate(e.target.value));
    }
  }

  return (
    <>
      <label htmlFor={ id }>{ label }</label>
      <input id={ id }
             type={ type }
             value={ value }
             min={ memberMin }
             max={ memberMax }
             className={ classInput }
             onBlur={ (e) => handleValidate(e) }
             onChange={ (e) => handleValidate(e) }
      />
      <div className="error-msg">{ error }</div>
    </>
  )
}

export default InputValidate;
