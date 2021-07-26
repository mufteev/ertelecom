import { memo } from 'react';
import TextField from '@material-ui/core/TextField';
import { Autocomplete } from '@material-ui/lab';

export const ComboBox = memo(function ({ label, value, options, getOptionLabel, onChange, onInputChange }) {
  return (
    <Autocomplete options={ options }
                  value={ value }
                  onChange={ onChange }
                  getOptionLabel={ getOptionLabel }
                  renderInput={ params => <TextField { ...params }
                                                     label={ label }
                                                     onChange={ onInputChange }
                                                     variant="outlined"/> }
    />
  )
})
