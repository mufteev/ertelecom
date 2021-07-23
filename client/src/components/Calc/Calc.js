import './Calc.css';
import React from 'react';
import Select from 'react-select';
import Network from './Network';
import InputValidate from '../InputValidate';
import { Valid } from './Valid';
import { nanoid } from '@reduxjs/toolkit';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  formatCurrency,
  declensionOfNumbers,
} from '../../util/format';
import {
  loadInfo,
  loadCities,
  setUserCount,
  loadCostTotal,
  changeValCity,
  setCompanyTin,
  setCompanyName,
  setMissedFields,
  clearStoreFields,
  setPeriodService,
  changeValTypeStorage,
  changeValArchiveDepth,
  changeValTypeProvision,
} from '../../store/calc';
import {
  Container, Row, Col,
  Card, Modal, Button
} from 'react-bootstrap';

const MemoSelect = React.memo(Select);

function Calc() {
  const [error, setError] = useState(null);
  const [showModalField, setShowModalField] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show : false,
    title: '',
    body : ''
  });
  const handleShowField = () => setShowModalField(true);
  const handleCloseField = () => setShowModalField(false);
  const handleCloseInfo = () => setModalInfo({ show: false, title: '', body: '' });
  const handleShowInfo = (title, body) => setModalInfo({ show: true, title: title, body: body });

  const calc = useSelector(state => state.calc);
  const dispatch = useDispatch();

  const getSelectOptionId = useCallback(({ id }) => id, []);
  const getSelectOptionName = useCallback(({ name }) => name, []);
  const getSelectOptionDepth = useCallback(({ depth }) => depth, []);
  const onChangeCity = useCallback(val => dispatch(changeValCity(val)), [dispatch]);
  const onChangeStorage = useCallback((storage) => dispatch(changeValTypeStorage(storage)), [dispatch]);
  const onChangeProvision = useCallback((provision) => dispatch(changeValTypeProvision(provision)), [dispatch]);
  const onChangeArchiveDepth = useCallback((archiveDepth) => dispatch(changeValArchiveDepth(archiveDepth)), [dispatch]);
  const searchCities = useCallback((search) => {
    if (typeof search !== 'string' || search.length < 3) {
      return;
    }
    Network
      .searchCitiesAsync(search)
      .then(data => dispatch(loadCities(data)))
      .then(() => setError(null))
      .catch(err => setError(err))
  }, [dispatch]);
  const onValidCompanyTin = useCallback(s => Valid.validCompanyTin(s), []);
  const onValidUsersCount = useCallback(s => Valid.validUsersCount(s), []);
  const onValidCompanyName = useCallback(s => Valid.validCompanyName(s), []);
  const onValidPeriodService = useCallback(s => Valid.validPeriodService(s), []);

  const onChangeUserCount = useCallback(s => dispatch(setUserCount(s)), [dispatch]);
  const onChangeCompanyTin = useCallback(s => dispatch(setCompanyTin(s)), [dispatch]);
  const onChangeCompanyName = useCallback(s => dispatch(setCompanyName(s)), [dispatch]);
  const onChangePeriodService = useCallback(s => dispatch(setPeriodService(s)), [dispatch]);

  useEffect(() => {
    Network
      .loadDirectoriesAsync()
      .then(data => dispatch(loadInfo(data)))
      .then(() => setError(null))
      .catch(err => setError(err));
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadCostTotal({
      cost_hdd_service: 0,
      cost_ssd_service: 0
    }));

    if (Valid.validUsersCount(calc.users_count)
      || Valid.validPeriodService(calc.period_service)
      || !(calc.type_storage?.id)
      || !(calc.archive_depth?.id)) {
      return;
    }

    const data = {
      users_count     : calc.users_count,
      period_service  : calc.period_service,
      type_storage_id : calc.type_storage.id,
      archive_depth_id: calc.archive_depth.id
    };

    Network
      .sendCalculationAsync(data)
      .then(data => dispatch(loadCostTotal(data)))
      .then(() => setError(null))
      .catch(err => setError(err));
  }, [
    dispatch,
    calc.users_count,
    calc.period_service,
    calc.type_storage?.id,
    calc.archive_depth?.id
  ]);

  function getTotal(type_storage, currency) {
    return currency
      ?
      (
        <div className="total-cost">
          <span className="pe-4">
            Стоимость услуги с использованием диска { type_storage } на { calc.period_service } мес.
            для { calc.users_count } { declensionOfNumbers(calc.users_count, 'пользователя', 'пользователей', 'пользователей') }
          </span>
          <span className="currency">{ formatCurrency(currency) }</span>
        </div>
      )
      : null;
  }

  function saveInfo() {
    const data = {
      users_count      : calc.users_count,
      company_tin      : calc.company_tin,
      company_name     : calc.company_name,
      period_service   : calc.period_service,
      city_id          : calc.city.id,
      type_storage_id  : calc.type_storage.id,
      archive_depth_id : calc.archive_depth.id,
      type_provision_id: calc.type_provision.id,
    }
    const missedFields = Valid.getMissedFields(data);
    if (missedFields.length > 0) {
      dispatch(setMissedFields(missedFields));
      handleShowField();
      return;
    }

    Network
      .saveHistoryAsync(data)
      .then(() => handleShowInfo('Сохранено', 'Информация о клиенте сохранена!'))
      .catch((err) => handleShowInfo('Ошибка', `Произошла ошибка при сохранении\n${ err }`));
  }

  function clearFields() {
    dispatch(clearStoreFields());
    handleShowInfo('Поля сброшены', 'Ok');
  }

  return (
    <Container className="p-2">
      <h3 className="text-center mb-5">Калькулятор по продукту "Офисный контроль"</h3>
      { error ? <div className="m-3 p-3 error-info">{ error }</div> : null }
      <Row className="justify-content-center">
        <Col sm="12" md="6">
          <Card>
            <Card.Header>Основная информация о клиенте</Card.Header>
            <Card.Body>
              <InputValidate id="company_name"
                             label="Название компании:"
                             value={ calc.company_name }
                             validate={ onValidCompanyName }
                             onChange={ onChangeCompanyName }
              />

              <InputValidate id="company_tin"
                             label="ИНН:"
                             value={ calc.company_tin }
                             validate={ onValidCompanyTin }
                             onChange={ onChangeCompanyTin }
              />

              <label htmlFor="city_select">Город клиента:</label>
              <MemoSelect placeholder="Поиск от 3 символов"
                          value={ calc.city }
                          onChange={ onChangeCity }
                          options={ calc.cities }
                          onInputChange={ searchCities }
                          getOptionValue={ getSelectOptionId }
                          getOptionLabel={ getSelectOptionName }
                          isClearable={ true }
                          isSearchable={ true }
              />

              <br/>

              <label htmlFor="type_provision">Какая услуга интересна:</label>
              <MemoSelect placeholder="Выберите тип услуги"
                          value={ calc.type_provision }
                          onChange={ onChangeProvision }
                          options={ calc.type_provisions }
                          getOptionValue={ getSelectOptionId }
                          getOptionLabel={ getSelectOptionName }
                          isSearchable={ false }
              />

              <br/>

              <InputValidate id="users_count"
                             label="Количество пользователей:"
                             value={ calc.users_count }
                             type="number"
                             min="1" max="250"
                             validate={ onValidUsersCount }
                             onChange={ onChangeUserCount }
              />
            </Card.Body>
          </Card>

          <br/>

          <Card>
            <Card.Header>Основные требования к оформлению облачного решения</Card.Header>
            <Card.Body>
              <label htmlFor="city_select">Количество месяцев хранения данных (глубина архива):</label>
              <MemoSelect placeholder="Выберите глубину"
                          value={ calc.archive_depth }
                          options={ calc.archive_depths }
                          onChange={ onChangeArchiveDepth }
                          getOptionValue={ getSelectOptionId }
                          getOptionLabel={ getSelectOptionDepth }
                          isSearchable={ false }
              />

              <br/>

              <label htmlFor="city_select">Тип жёсткого диска:</label>
              <MemoSelect placeholder="Выберите тип диска"
                          value={ calc.type_storage }
                          options={ calc.type_storages }
                          onChange={ onChangeStorage }
                          getOptionValue={ getSelectOptionId }
                          getOptionLabel={ getSelectOptionName }
                          isSearchable={ false }
              />
              <br/>

              <InputValidate id="period_use_service"
                             label="Период пользования услугой (месяцев):"
                             value={ calc.period_service }
                             type="number"
                             min="1"
                             validate={ onValidPeriodService }
                             onChange={ onChangePeriodService }
              />

            </Card.Body>
          </Card>

          <br/>

          <Card>
            <Card.Header>Итоговая стоимость облачного офисного контроля</Card.Header>
            <Card.Body>
              {
                calc.cost_hdd_service || calc.cost_ssd_service
                  ?
                  <div>
                    { getTotal('HDD', calc.cost_hdd_service) }
                    { getTotal('SSD', calc.cost_ssd_service) }
                  </div>
                  :
                  <div>Подсчёт...</div>
              }
            </Card.Body>
          </Card>

          <br/>

          <div>
            <Button variant="outline-success" className="w-100"
                    onClick={ saveInfo }>
              Сохранить информацию о заказе
            </Button>
          </div>

          <br/>

          <div>
            <Button variant="outline-danger" className="w-100"
                    onClick={ clearFields }>
              Сбросить поля
            </Button>
          </div>

        </Col>
      </Row>
      <Modal show={ showModalField } centered onHide={ handleCloseField } animation={ false }>
        <Modal.Header>
          <Modal.Title>Необходимо заполнить следующие поля</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            { calc.missed_field.map(x => <li key={ nanoid() }>{ x }</li>) }
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={ handleCloseField }>
            Ок
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={ modalInfo.show } centered onHide={ handleCloseInfo } animation={ false }>
        <Modal.Header>
          <Modal.Title>{ modalInfo.title }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            { modalInfo.body }
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={ handleCloseInfo }>
            Ок
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Calc;
