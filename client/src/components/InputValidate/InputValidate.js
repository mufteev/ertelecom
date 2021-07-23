import { useCallback, useEffect, useMemo, useState, useRef, memo } from 'react';
import { isFunction, isNullOrWhiteSpace } from '../../util/validation';

export default memo(function ({ id, label, value, validate, onChange, type = 'text', min, max }) {
  const ref = useRef(null);

  const [minVal, setMin] = useState(null);
  const [maxVal, setMax] = useState(null);
  const [error, setError] = useState(undefined);

  const memoMin = useMemo(() => minVal, [minVal]);
  const memoMax = useMemo(() => maxVal, [maxVal]);
  const memoError = useMemo(() => error, [error]);

  useEffect(() => {
    if (type === 'number') {
      setMin(min);
      setMax(max);
    }
  }, [type, min, max]);

  useEffect(() => {
    const isValid = isNullOrWhiteSpace(error);
    const isInvalid = !isNullOrWhiteSpace(error) && error !== undefined;
    ref.current?.classList.toggle('is-valid', isValid);
    ref.current?.classList.toggle('is-invalid', isInvalid);
  }, [error]);

  const onHandleValidate = useCallback(e => {
    if (isFunction(onChange)) {
      onChange(e.target.value);
    }
    if (isFunction(validate)) {
      setError(validate(e.target.value));
    }
  }, [onChange, validate]);

  return (
    <>
      <label htmlFor={ id }>{ label }</label>
      <input id={ id }
             ref={ ref }
             type={ type }
             value={ value }
             min={ memoMin }
             max={ memoMax }
             className="form-control"
             onBlur={ onHandleValidate }
             onChange={ onHandleValidate }
      />
      <div className="error-msg">{ memoError }</div>
    </>
  )
});
