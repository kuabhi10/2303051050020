const express = require('express');
const { handleSchedule } = require('../controllers/scheduler');
const { Log } = require('../../../logging-middleware');

const router = express.Router();

router.use((req, res, next) => {
    Log('backend', 'info', 'route', `Route entry: ${req.method} ${req.originalUrl}`);
    next();
});

router.get('/:depotId', handleSchedule);

module.exports = router;
