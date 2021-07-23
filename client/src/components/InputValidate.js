import { useCallback, useEffect, useMemo, useState, useRef, memo } from 'react';

function InputValidate({ id, label, value, validate, onChange, type = 'text', min, max }) {
  const ref = useRef(null);

  const [minVal, setMin] = useState(null);
  const [maxVal, setMax] = useState(null);
<<<<<<< HEAD
  const [serror, setError] = useState(undefined);
  const [inputClass, setInputClass] = useState(initInputClass);

  const memoMin = useMemo(() => minVal, [minVal]);
  const memoMax = useMemo(() => maxVal, [maxVal]);
  const memoError = useMemo(() => serror, [serror]);
  const memoClass = useMemo(() => inputClass.join(' '), [inputClass]);

=======
  const [error, setError] = useState(undefined);

  const memoMin = useMemo(() => minVal, [minVal]);
  const memoMax = useMemo(() => maxVal, [maxVal]);
  const memoError = useMemo(() => error, [error]);
>>>>>>> 6b0d20f14aba3597680eec3e7851a067fc90f399

  useEffect(() => {
    if (type === 'number') {
      setMin(min);
      setMax(max);
    }
  }, [type, min, max]);

  useEffect(() => {
<<<<<<< HEAD
    if (serror === null) {
      setInputClass([...initInputClass, 'is-valid']);
    }
    if (!!serror) {
      setInputClass([...initInputClass, 'is-invalid']);
    }
  }, [serror])
=======
    ref.current?.classList.toggle('is-valid', error === null);
    ref.current?.classList.toggle('is-invalid', !!error);
  }, [error]);
>>>>>>> 6b0d20f14aba3597680eec3e7851a067fc90f399

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
}

export default memo(InputValidate);
