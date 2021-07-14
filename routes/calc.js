const router = require('express').Router();
const db = require('../db');
const { response, eMsg, availableParam } = require('../util');

router.get('/get_directory_inf', async (req, res) => {
  try {
    const [
      type_provision,
      archive_depth,
      type_storage,
    ] = await Promise.all([
      db.queryAsync('SELECT id, name FROM info.type_provision'),
      db.queryAsync('SELECT id, depth FROM info.archive_depth'),
      db.queryAsync('SELECT id, name FROM info.type_storage_service'),
    ])

    return response.setResult(res, {
      type_provision: type_provision.rows,
      archive_depth : archive_depth.rows,
      type_storage  : type_storage.rows
    });
  } catch (err) {
    console.error(err);
    return response.setError(res, eMsg.ERROR_QUERY);
  }
});

router.get('/get_cities_search', async (req, res) => {
  try {
    const escape_wildcards = req.query.s.replace(/([%_])/gm, '\\$1');
    const search_text = `%${ escape_wildcards }%`;
    const cities = (await db.queryAsync(`
      SELECT id, name
      FROM info.city
      WHERE name ILIKE $1;
    `, [search_text])).rows;

    return response.setResult(res, cities);
  } catch (err) {
    console.error(err);
    return response.setError(res, eMsg.ERROR_QUERY);
  }
});

router.post('/calculating', async (req, res) => {
  try {
    if (!availableParam(req.body, 'users_count', 'period_service', 'archive_depth_id', 'type_storage_id')) {
      return response.setError(res, eMsg.ERROR_ARGUMENT);
    }

    const users_count = Number(req.body.users_count);
    const period_service = Number(req.body.period_service);
    const archive_depth_id = req.body.archive_depth_id;
    const type_storage_id = req.body.type_storage_id;

    const cost_total = (await db.queryAsync(`
      SELECT license_config_id,
             CASE ts.type @> ARRAY ['hdd']
               WHEN TRUE THEN
                 (cost_license * $1 + cost_vm_per_month + cost_hdd_storage * ad.depth) * $2
             END AS cost_hdd_service,
             CASE ts.type @> ARRAY ['ssd']
               WHEN TRUE THEN
                 (cost_license * $1 + cost_vm_per_month + cost_ssd_storage * ad.depth) * $2
             END AS cost_ssd_service
      FROM info_price.view_license_base lb,
           (SELECT depth
            FROM info.archive_depth
            WHERE id = $3) ad,
           (SELECT type
            FROM info.type_storage_service
            WHERE id = $4) ts
      WHERE ($1 BETWEEN user_from AND user_to)
    `, [
      users_count,
      period_service,
      archive_depth_id,
      type_storage_id
    ])).rows[0];

    return response.setResult(res, cost_total);
  } catch (err) {
    console.error(err);
    return response.setError(res, eMsg.ERROR_QUERY);
  }
});

router.use((req, res) => {
  res.status(404).send('Ресурс не найден [File not found]');
});

module.exports = router;
