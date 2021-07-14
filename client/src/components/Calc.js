import './Calc.css';
import {
  Container, Row, Col,
  Card, Modal, Button
} from 'react-bootstrap';
import Select from 'react-select';
import { useEffect, useState } from 'react';
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
} from '../store/calc';
import InputValidate from './InputValidate';
import { digitValidate, tinValidate, isNullOrWhiteSpace } from '../util/validation';
import { formatCurrency, declensionOfNumbers } from '../util/format';
import { getJSON, postJSON } from '../util/request';

function Calc() {
  const dispatch = useDispatch();
  const calc = useSelector(state => state.calc);
  const [showModalField, setShowModalField] = useState(false);
  const handleShowField = () => setShowModalField(true);
  const handleCloseField = () => setShowModalField(false);
  const [modalInfo, setModalInfo] = useState({
    show : false,
    title: '',
    body : ''
  });
  const handleShowInfo = (title, body) => setModalInfo({ show: true, title: title, body: body });
  const handleCloseInfo = () => setModalInfo({ show: false });

  useEffect(() => {
    (async () => {
      try {
        const response = await getJSON('/api/calc/get_directory_info');

        if (response.errorCode === 0) {
          dispatch(loadInfo(response.data));
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        dispatch(loadCostTotal({
          cost_hdd_service: 0,
          cost_ssd_service: 0
        }));
        const data = {
          users_count     : calc.users_count,
          period_service  : calc.period_service,
          type_storage_id : calc.type_storage_value && calc.type_storage_value.id,
          archive_depth_id: calc.archive_depth_value && calc.archive_depth_value.id
        };
        if (!(data.type_storage_id && data.archive_depth_id)) {
          return;
        }

        const response = await postJSON('/api/calc/calculating', data);

        if (response.errorCode === 0) {
          dispatch(loadCostTotal(response.data));
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [
    calc.users_count,
    calc.period_service,
    calc.type_storage_value,
    calc.archive_depth_value
  ]);

  function searchCities(search) {
    (async () => {
      if (typeof search !== 'string' || search.length === 0) {
        return;
      }

      try {
        const response = await getJSON(`/api/calc/get_cities_search?s=${ search }`);
        if (response.errorCode === 0) {
          dispatch(loadCities(response.data));
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }

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
      calc.city_value === null ? 'Город клиента' : '',
      calc.type_provision_value === null ? 'Какая услуга интересна' : '',
      digitValidate(calc.users_count, 1, 250) ? 'Количество пользователей' : '',
      calc.archive_depth_value === null ? 'Количество месяцев хранения данных' : '',
      calc.type_storage_value === null ? 'Тип жёсткого диска' : '',
      digitValidate(calc.period_service, 1) ? 'Период пользования услугой' : ''
    ].filter(x => x.length > 0);
    if (missedFields.length > 0) {
      dispatch(setMissedFields(missedFields));
      handleShowField();
      return;
    }

    (async () => {
      try {
        const data = {
          users_count      : calc.users_count,
          company_tin      : calc.company_tin,
          company_name     : calc.company_name,
          period_service   : calc.period_service,
          city_id          : calc.city_value.id,
          type_storage_id  : calc.type_storage_value.id,
          archive_depth_id : calc.archive_depth_value.id,
          type_provision_id: calc.type_provision_value.id,
        }

        const response = await postJSON('/api/history/save', data);

        if (response.errorCode === 0) {
          handleShowInfo('Сохранено', 'Информация о клиенте сохранена!');
        } else {
          handleShowInfo('Ошибка', `Произошла ошибка при сохранении\n${ response.errorMessage }`);
        }
      } catch (e) {
        console.log(e);
      }
    })()
  }

  function clearFields() {
    dispatch(clearStoreFields());
    handleShowInfo('Ok', 'Ok');
  }

  return (
    <Container className="p-2">
      <h3 className="text-center mb-5">Калькулятор по продукту "Офисный контроль"</h3>
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
              <Select options={ calc.cities }
                      value={ calc.city_value }
                      onChange={ val => dispatch(changeValCity(val)) }
                      placeholder="Поиск от 3 символов"
                      isClearable={ true }
                      isSearchable={ true }
                      getOptionValue={ ({ id }) => id }
                      getOptionLabel={ ({ name }) => name }
                      onInputChange={ (s) => searchCities(s) }
              />

              <br/>

              <label htmlFor="type_provision">Какая услуга интересна:</label>
              <Select options={ calc.type_provision }
                      value={ calc.type_provision_value }
                      onChange={ val => dispatch(changeValTypeProvision(val)) }
                      placeholder="Выберите тип услуги"
                      isSearchable={ false }
                      getOptionValue={ ({ id }) => id }
                      getOptionLabel={ ({ name }) => name }
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
              <Select options={ calc.archive_depth }
                      value={ calc.archive_depth_value }
                      onChange={ val => dispatch(changeValArchiveDepth(val)) }
                      placeholder="Выберите глубину"
                      isSearchable={ false }
                      getOptionValue={ ({ id }) => id }
                      getOptionLabel={ ({ depth }) => depth }
              />

              <br/>

              <label htmlFor="city_select">Тип жёсткого диска:</label>
              <Select options={ calc.type_storage }
                      value={ calc.type_storage_value }
                      onChange={ val => dispatch(changeValTypeStorage(val)) }
                      placeholder="Выберите тип диска"
                      isSearchable={ false }
                      getOptionValue={ ({ id }) => id }
                      getOptionLabel={ ({ name }) => name }
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
