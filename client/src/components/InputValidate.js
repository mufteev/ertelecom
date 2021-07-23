import React, { useCallback, useEffect, useMemo, useState } from 'react';

const initInputClass = ['form-control'];

function InputValidate({ id, label, value, validate, onChange, type = 'text', min, max }) {
  const [minVal, setMin] = useState(null);
  const [maxVal, setMax] = useState(null);
  const [serror, setError] = useState(undefined);
  const [inputClass, setInputClass] = useState(initInputClass);

  const memoMin = useMemo(() => minVal, [minVal]);
  const memoMax = useMemo(() => maxVal, [maxVal]);
  const memoError = useMemo(() => serror, [serror]);
  const memoClass = useMemo(() => inputClass.join(' '), [inputClass]);


  useEffect(() => {
    if (type === 'number') {
      setMin(min);
      setMax(max);
    }
  }, [type, min, max]);

  useEffect(() => {
    if (serror === null) {
      setInputClass([...initInputClass, 'is-valid']);
    }
    if (!!serror) {
      setInputClass([...initInputClass, 'is-invalid']);
    }
  }, [serror])

  const onHandleValidate = useCallback(e => {
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
    if (typeof validate === 'function') {
      setError(validate(e.target.value));
    }
  }, [onChange, validate]);

  return (
    <>
      <label htmlFor={ id }>{ label }</label>
      <input id={ id }
             type={ type }
             value={ value }
             min={ memoMin }
             max={ memoMax }
             className={ memoClass }
             onBlur={ onHandleValidate }
             onChange={ onHandleValidate }
      />
      <div className="error-msg">{ memoError }</div>
    </>
  )
}

export default React.memo(InputValidate);
