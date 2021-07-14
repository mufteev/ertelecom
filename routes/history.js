const router = require('express').Router();
const db = require('../db');
const { response, eMsg, availableParam, validTin, isNullOrWhiteSpace, pdfReportTemplate } = require('../util');
const pdfMaker = require('pdfmake');
const pdfFonts = require('../fontsPDF/Roboto');
const { formatDate, formatNumberAsCurrency } = require('../util/format');
const { addDays } = require('../util/date');

function isErrorSaveInfo(data) {
  if (/^\s*$/.test(data.company_name)) {
    return 'Не заполнено название клиента';
  }
  if (!validTin(data.company_tin)) {
    return 'Не валидное ИНН клиента';
  }
  if (Number.isNaN(data.users_count)) {
    return 'Не указано количество пользователей';
  }
  if (Number.isNaN(data.period_service)) {
    return 'Не указан период пользования услугой';
  }
  if (isNullOrWhiteSpace(data.cities_id)) {
    return 'Не указан город клиента';
  }
  if (isNullOrWhiteSpace(data.type_storage_id)) {
    return 'Не указан тип жёсткого диска';
  }
  if (isNullOrWhiteSpace(data.archive_depth_id)) {
    return 'Не указана глубина архива';
  }
  if (isNullOrWhiteSpace(data.type_provision_id)) {
    return 'Не указана интересующая услуга';
  }

  return null;
}

router.post('/save', async (req, res) => {
  try {
    if (!availableParam(req.body,
      'users_count', 'company_tin', 'company_name', 'period_service',
      'city_id', 'type_storage_id', 'archive_depth_id', 'type_provision_id')) {
      return response.setError(res, eMsg.ERROR_ARGUMENT);
    }

    const data = {
      company_name     : req.body.company_name,
      users_count      : Number(req.body.users_count),
      period_service   : Number(req.body.period_service),
      company_tin      : req.body.company_tin,
      city_id          : req.body.city_id,
      type_storage_id  : req.body.type_storage_id,
      archive_depth_id : req.body.archive_depth_id,
      type_provision_id: req.body.type_provision_id,
      create_at        : new Date(),
    };
    const error = isErrorSaveInfo(data);
    if (error) {
      console.error(error);
      return response.setError(res, { code: eMsg.ERROR_ARGUMENT.code, msg: error });
    }

    const result = (await db.queryAsync(`
      SELECT history.save(
        p_company_name      := $1,
        p_company_tin       := $2,
        p_city_id           := $3,
        p_type_provision_id := $4,
        p_users_count       := $5,
        p_archive_depth_id  := $6,
        p_type_storage_id   := $7,
        p_period_service    := $8,
        p_create_at         := $9) AS result
    `, [
      data.company_name,
      data.company_tin,
      data.city_id,
      data.type_provision_id,
      data.users_count,
      data.archive_depth_id,
      data.type_storage_id,
      data.period_service,
      data.create_at,
    ])).rows[0].result;

    return response.setResult(res, result);
  } catch (err) {
    console.error(err);
    return response.setError(res, eMsg.ERROR_QUERY);
  }
});

router.get('/get_all', async (req, res) => {
  try {

    const requests = (await db.queryAsync(`
      SELECT id,
             company_name,
             type_provision,
             tin,
             city_name,
             users_count,
             period_service,
             create_at,
             type_storage_name,
             archive_depth,
             cost_service_hdd,
             cost_service_ssd,
             cost_service_hdd_per_month,
             cost_service_ssd_per_month
      FROM history.view_history
      ORDER BY create_at DESC
    `)).rows;

    return response.setResult(res, requests);
  } catch (err) {
    console.error(err);
    return response.setError(res, eMsg.ERROR_QUERY);
  }
});

router.get('/download', async (req, res) => {
  try {
    if (!availableParam(req.query, 'order_id')) {
      return response.setResult(res, eMsg.ERROR_ARGUMENT);
    }

    const order_id = req.query.order_id;

    let [
      calc_request,
      offer_until_days
    ] = await Promise.all([
      db.queryAsync(`
        SELECT id,
               company_name,
               type_provision,
               tin,
               city_name,
               users_count,
               period_service,
               create_at,
               type_storage_name,
               type_storage,
               archive_depth,
               cost_service_hdd,
               cost_service_ssd,
               cost_service_hdd_per_month,
               cost_service_ssd_per_month
        FROM history.view_history
        WHERE id = $1
        ORDER BY create_at DESC
      `, [
        order_id
      ]),
      db.queryAsync(`SELECT get_unit_cost_value('offer_until_date') AS result`)
    ]);

    calc_request = calc_request.rows[0];
    offer_until_days = Number(offer_until_days.rows[0].result);

    if (Number.isNaN(offer_until_days)) {
      throw 'offer_until_days - NaN';
    }

    calc_request.offer_until_date = formatDate(addDays(new Date(calc_request.create_at), offer_until_days));
    calc_request.create_at = formatDate(calc_request.create_at);
    if (calc_request.type_storage.includes('hdd')) {
      calc_request.cost_service_hdd_per_month = formatNumberAsCurrency(calc_request.cost_service_hdd_per_month);
      calc_request.cost_service_hdd = formatNumberAsCurrency(calc_request.cost_service_hdd);
    }
    if (calc_request.type_storage.includes('ssd')) {
      calc_request.cost_service_ssd_per_month = formatNumberAsCurrency(calc_request.cost_service_ssd_per_month);
      calc_request.cost_service_ssd = formatNumberAsCurrency(calc_request.cost_service_ssd);
    }

    const template = pdfReportTemplate(calc_request);
    const printer = new pdfMaker(pdfFonts);
    const pdf = printer.createPdfKitDocument(template);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${ calc_request.create_at }.pdf`);

    pdf.pipe(res);
    pdf.end();

  } catch (err) {
    console.error(err);
    return response.setError(res, eMsg.ERROR_QUERY);
  }
});

router.use((req, res) => {
  res.status(404).send('Ресурс не найден [File not found]');
});

module.exports = router;
