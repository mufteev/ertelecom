import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ComboBox } from '../ComboBox';
import { Container, Grid, Typography, TextField, List, ListItem, ListSubheader } from '@material-ui/core';

const useStyle = makeStyles({
  root  : {
    padding: '1rem'
  },
  header: {
    marginBottom: '2rem',
    textAlign   : 'center'
  },
  gridItem: {
    flexDirection: 'center',

  }
});
const GridItem = ({ children }) =>
  <Grid item xs={ 12 } component="div">{ children }</Grid>;


export function Calc() {
  const classes = useStyle();
  const [val, setVal] = useState('');
  const [options, setOptions] = useState([]);
  const [city, setCity] = useState(null);

  useEffect(() => {
    setOptions([
      { id: 1, text: 'Аргентина' },
      { id: 2, text: 'Пермь' },
    ])
  }, []);

  const onChangeCity = (val) => {
    setCity(val);
  }

  return (
    <Container maxWidth="sm" className={ classes.root }>
      <Typography variant="h4" className={ classes.header }>
        Калькулятор по продукту "Офисный контроль"
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <GridItem>
          <TextField variant="outlined"
                     value={ val }
                     fullWidth
                     onChange={ (e) => setVal(e.target.value) }
                     label="Наименование компании"
          />
        </GridItem>

        <GridItem>
          <TextField variant="outlined"
                     value={ val }
                     fullWidth
                     onChange={ (e) => setVal(e.target.value) }
                     label="ИНН"
          />
        </GridItem>
        <GridItem>
          <ComboBox options={ options }
                    value={ city }
                    onChange={ onChangeCity }
                    getOptionLabel={ option => option.text }
                    label="Город клиента"
          />
        </GridItem>
      </Grid>
    </Container>
  );
}
