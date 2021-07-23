import { useCallback, useEffect, useMemo, useState, useRef, memo } from 'react';

<<<<<<< HEAD
export default memo(function ({ idd, label, value, validate, onChange, type = 'text', min, max }) {
=======
export default memo(function ({ ids, label, value, validate, onChange, type = 'text', min, max }) {
>>>>>>> 0a423032958ac3f715ea14d72c523bbb7520c384
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
    ref.current?.classList.toggle('is-valid', error === null);
    ref.current?.classList.toggle('is-invalid', !!error);
  }, [error]);

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
<<<<<<< HEAD
      <label htmlFor={ idd }>{ label }</label>
      <input id={ idd }
=======
      <label htmlFor={ ids }>{ label }</label>
      <input id={ ids }
>>>>>>> 0a423032958ac3f715ea14d72c523bbb7520c384
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
