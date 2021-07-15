import './History.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postJSON } from '../../util/request';
import { loadRequests } from '../../store/history';
import { Col, Container, Row, InputGroup, FormControl, Button } from 'react-bootstrap';
import { formatCurrency, formatDateTime } from '../../util/format';
import { isNullOrWhiteSpace } from '../../util/validation';

function History() {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const history = useSelector(state => state.history);

  useEffect(() => {
    (async () => {
      try {
        const response = await postJSON('/api/history/search');

        if (response.errorCode === 0) {
          dispatch(loadRequests(response.data));
        }
      } catch (e) {
        const msg = e instanceof Response && e.status === 504
          ? 'Сервер не доступен'
          : e.statusText;
        setError(msg);
      }
    })()
  }, []);

  function getTotal(type_storage, currency) {
    return currency
      ? <div>Стоимость с HDD: <span className="currency">{ formatCurrency(currency) }</span></div>
      : null
  }

  function request(data) {
    return (
      <div key={ data.id } className="mb-4 border border-secondary rounded p-2">
        <div className="d-flex justify-content-between align-items-center">
          <span>{ data.company_name }, ИНН { data.tin }</span>
          <a href={ `/api/history/download?order_id=${ data.id }` }
             target="_blank" rel="noreferrer"
             className="btn btn-sm btn-outline-secondary">
            Экспорт
          </a>
        </div>
        <div className="request-time">{ formatDateTime(data.create_at) }</div>
        <hr/>
        <div>Город: { data.city_name }</div>
        <div>Количество пользователей: { data.users_count }</div>
        <div>Глубина архива: { data.archive_depth } мес.</div>
        <div>Период пользования: { data.period_service } мес.</div>
        <div>{ getTotal('HDD', data.cost_service_hdd) }</div>
        <div>{ getTotal('SSD', data.cost_service_ssd) }</div>
      </div>
    );
  }

  function searchHistory(s) {
    setSearch(s);
    if (s.length >= 3) {
      (async () => {
        try {
          const data = {
            query: s
          };
          const response = await postJSON('/api/history/search', data);

          if (response.errorCode === 0) {
            dispatch(loadRequests(response.data));
          }
        } catch (e) {
          const msg = e instanceof Response && e.status === 504
            ? 'Сервер не доступен'
            : e.statusText;
          setError(msg);
        }
      })();
    }
  }

  return (
    <Container className="p-2">
      <h3 className="text-center mb-5">Ранее произведённые расчёты</h3>
      { error ? <div className="m-3 p-3 error-info">{ error }</div> : null }
      <Row className="justify-content-center">
        <Col sm="12" md="6">
          <InputGroup>
            <FormControl value={ search }
                         placeholder="Поиск от трёх символов"
                         onChange={ e => searchHistory(e.target.value) }
            />
            {
              !isNullOrWhiteSpace(search)
                ?
                (
                  <Button variant="outline-danger" onClick={() => searchHistory('') }>
                    Очистить
                  </Button>
                )
                : null
            }
          </InputGroup>

          <br/>

          {
            history
              .requests
              .map(x => request(x))
          }
        </Col>
      </Row>
    </Container>
  );
}

export default History;
