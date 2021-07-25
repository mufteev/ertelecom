import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

export function ComboBox({ label, value, options, getOptionLabel, onChange }) {
  return (
    <Autocomplete options={ options }
                  value={ value }
                  onChange={ onChange }
                  getOptionLabel={ getOptionLabel }
                  renderInput={ params => <TextField { ...params }
                                                     label={ label }
                                                     variant="outlined"
                  /> }
    />
  )
}
