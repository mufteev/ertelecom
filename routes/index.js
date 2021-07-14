const router = require('express').Router();
const calc = require('./calc');
const history = require('./history');

router.use('/calc', calc);
router.use('/history', history);

router.use((req, res) => {
  res.status(404).send('Ресурс не найден [File not found]');
});

module.exports = router;
