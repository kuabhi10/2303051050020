const express = require('express');
const config = require('./config');
const schedulerRoutes = require('./routes/scheduler');
const errorHandler = require('./middleware/errorHandler');
const { Log } = require('../../logging-middleware');

const app = express();

app.use(express.json());

app.use('/api/schedule', schedulerRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
    Log('backend', 'info', 'config', `Server startup: Listening on port ${config.port}`);
});
