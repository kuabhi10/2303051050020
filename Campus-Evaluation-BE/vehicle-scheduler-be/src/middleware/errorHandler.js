const { Log } = require('../../../logging-middleware');

function errorHandler(err, req, res, next) {
    Log('backend', 'error', 'middleware', `Exception caught in errorHandler: ${err.message}`);
    
    if (err.response) {
        Log('backend', 'error', 'middleware', `Evaluation API failure, returned HTTP ${err.response.status}`);
        return res.status(502).json({ error: 'Evaluation API failure' });
    }
    if (err.status) {
        Log('backend', 'error', 'middleware', `Error response sent: ${err.status} ${err.message}`);
        return res.status(err.status).json({ error: err.message });
    }

    Log('backend', 'error', 'middleware', 'Error response sent: 500 Internal Server Error');
    res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorHandler;
