import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ComboBox } from '../ComboBox';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyle = makeStyles({
  root       : {
    padding: '1rem'
  },
  header     : {
    marginBottom: '2rem',
    textAlign   : 'center'
  },
  block      : {
    border : '1px solid hsl(0, 0%, 75%)',
    padding: '8px',
    margin : '8px'
  },
  blockHeader: {
    marginBottom: '1rem',
    textAlign   : 'center'
  },
  gridItem   : {
    flexDirection: 'center',

  }
});
const GridItem = ({ children }) => <Grid item xs={ 12 } component="div">{ children }</Grid>;
const MemoTextField = memo(TextField);


export function Calc() {
  const classes = useStyle();

  const [city, setCity] = useState(null);
  const [options, setOptions] = useState([]);
  const [companyTin, setCompanyTin] = useState('');
  const [companyName, setCompanyName] = useState('');

  const memoCity = useMemo(() => city, [city]);
  const memoOptions = useMemo(() => options, [options]);
  const memoCompanyTin = useMemo(() => companyTin, [companyTin]);
  const memoCompanyName = useMemo(() => companyName, [companyName]);


  useEffect(() => {
    setOptions([
      { id: 1, text: 'Аргентина' },
      { id: 2, text: 'Пермь' },
    ])
  }, []);

  const getOptionText = useCallback(({ text }) => text, []);
  const onChangeCity = useCallback((e, v) => setCity(v), [setCity]);
  const onChangeCompanyTin = useCallback((e) => setCompanyTin(e.target.value), [setCompanyTin]);
  const onChangeCompanyName = useCallback((e) => setCompanyName(e.target.value), [setCompanyName]);

  return (
    <Container maxWidth="sm" className={ classes.root }>
      <Typography variant="h4" className={ classes.header }>
        Калькулятор по продукту "Офисный контроль"
      </Typography>

      <div className={ classes.block }>
        <Typography variant="h6" className={ classes.blockHeader }>
          Основная информация о клиенте
        </Typography>
        <Grid container spacing={ 3 } justifyContent="center">
          <GridItem>
            <MemoTextField label="Наименование компании"
                           value={ memoCompanyName }
                           onChange={ onChangeCompanyName }
                           variant="outlined"
                           fullWidth
            />
          </GridItem>

          <GridItem>
            <MemoTextField label="ИНН"
                           value={ memoCompanyTin }
                           onChange={ onChangeCompanyTin }
                           variant="outlined"
                           fullWidth
            />
          </GridItem>
          <GridItem>
            <ComboBox label="Город клиента"
                      value={ memoCity }
                      options={ memoOptions }
                      onChange={ onChangeCity }
                      getOptionLabel={ getOptionText }
            />
          </GridItem>
        </Grid>
      </div>

      <div className={ classes.block }>
        <Typography variant="h6" className={ classes.blockHeader }>
          Основные требования к оформлению облачного решения
        </Typography>
        <Grid container spacing={ 3 } justify="center">
          <GridItem>
            <ComboBox label="Количество месяцев хранения данных"
                      value={ memoCity }
                      options={ memoOptions }
                      onChange={ onChangeCity }
                      getOptionLabel={ getOptionText }
            />
          </GridItem>
          <GridItem>
            <ComboBox label="Тип жёсткого диска"
                      value={ memoCity }
                      options={ memoOptions }
                      onChange={ onChangeCity }
                      getOptionLabel={ getOptionText }
            />
          </GridItem>
          <GridItem>
            <TextField label="Период пользования услугой (мес.)"
                       value={ memoCompanyTin }
                       onChange={ onChangeCompanyTin }
                       variant="outlined"
                       fullWidth
            />
          </GridItem>
        </Grid>
      </div>

      <div className={ classes.block }>
        <Typography variant="h6" className={ classes.blockHeader }>
          Итоговая стоимость облачного офисного контроля
        </Typography>
        <Grid container spacing={ 3 } justify="center">
          <GridItem>
            Стоимость услуги с использованием HDD
          </GridItem>
          <GridItem>
            Стоимость услуги с использованием SSD
          </GridItem>
        </Grid>
      </div>
    </Container>
  );
}
