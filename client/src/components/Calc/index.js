import './Calc.css';
import {
  Container, Row, Col,
  Card, Modal, Button
} from 'react-bootstrap';
import Select from 'react-select';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadInfo,
  loadCities,
  loadCostTotal,
  setUserCount,
  setCompanyTin,
  setCompanyName,
  setPeriodService,
  setMissedFields,
  changeValCity,
  changeValTypeStorage,
  changeValArchiveDepth,
  changeValTypeProvision,
  clearStoreFields,
} from '../../store/calc';
import InputValidate from '../InputValidate';
import { digitValidate, tinValidate, isNullOrWhiteSpace } from '../../util/validation';
import { formatCurrency, declensionOfNumbers } from '../../util/format';
import Network from './Network';

const MemoSelect = React.memo(Select);

function Calc() {
  const [error, setError] = useState(null);
  const [showModalField, setShowModalField] = useState(false);
  const handleShowField = () => setShowModalField(true);
  const handleCloseField = () => setShowModalField(false);
  const [modalInfo, setModalInfo] = useState({
    show : false,
    title: '',
    body : ''
  });
  const handleCloseInfo = () => setModalInfo({ show: false });
  const handleShowInfo = (title, body) => setModalInfo({ show: true, title: title, body: body });

  const calc = useSelector(state => state.calc);
  const dispatch = useDispatch();

  const getSelectOptionId = useCallback(({ id }) => id, []);
  const getSelectOptionName = useCallback(({ name }) => name, []);
  const getSelectOptionDepth = useCallback(({ depth }) => depth, []);
  const changeCity = useCallback(val => dispatch(changeValCity(val)), [dispatch]);
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

    if (!(calc.type_storage && calc.type_storage.id)
      || !(calc.archive_depth && calc.archive_depth.id)) {
      return;
    }

    const data = {
      users_count     : calc.users_count,
      period_service  : calc.period_service,
      type_storage_id : calc.type_storage && calc.type_storage.id,
      archive_depth_id: calc.archive_depth && calc.archive_depth.id
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
    calc.type_storage,
    calc.archive_depth
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
    const missedFields = [
      isNullOrWhiteSpace(calc.company_name) ? 'Название компании' : '',
      !tinValidate(calc.company_tin) ? 'ИНН' : '',
      calc.city === null ? 'Город клиента' : '',
      calc.type_provision === null ? 'Какая услуга интересна' : '',
      digitValidate(calc.users_count, 1, 250) ? 'Количество пользователей' : '',
      calc.archive_depth === null ? 'Количество месяцев хранения данных' : '',
      calc.type_storage === null ? 'Тип жёсткого диска' : '',
      digitValidate(calc.period_service, 1) ? 'Период пользования услугой' : ''
    ].filter(x => x.length > 0);
    if (missedFields.length > 0) {
      dispatch(setMissedFields(missedFields));
      handleShowField();
      return;
    }

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
                             validate={ s => isNullOrWhiteSpace(s) ? 'Введите название компании' : null }
                             onChange={ s => dispatch(setCompanyName(s)) }
              />

              <InputValidate id="company_tin"
                             label="ИНН:"
                             value={ calc.company_tin }
                             validate={ s => !tinValidate(s) ? 'ИНН не верное' : null }
                             onChange={ s => dispatch(setCompanyTin(s)) }
              />

              <label htmlFor="city_select">Город клиента:</label>
              <MemoSelect placeholder="Поиск от 3 символов"
                          value={ calc.city }
                          onChange={ changeCity }
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
                             validate={ s => digitValidate(s, 1, 250) }
                             onChange={ s => dispatch(setUserCount(s)) }
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
                             validate={ s => digitValidate(s, 1) }
                             onChange={ s => dispatch(setPeriodService(s)) }
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
                  : <div>Подсчёт...</div>
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
            { calc.missed_field.map(x => <li key={ x }>{ x }</li>) }
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
