const { scheduleMaintenance } = require('../services/scheduler');
const { Log } = require('../../../logging-middleware');

async function handleSchedule(req, res, next) {
    Log('backend', 'info', 'controller', 'Request received to schedule maintenance');
    
    try {
        const { depotId } = req.params;
        const { availableHours } = req.query;
        
        Log('backend', 'info', 'controller', `Validating request for depotId: ${depotId}`);
        
        if (!depotId) {
            Log('backend', 'warn', 'controller', 'Invalid input: Missing depotId');
            return res.status(400).json({ error: 'Missing depotId' });
        }
        
        if (!availableHours || isNaN(Number(availableHours)) || Number(availableHours) <= 0) {
            Log('backend', 'warn', 'controller', 'Invalid input: Invalid or missing availableHours');
            return res.status(400).json({ error: 'Invalid availableHours' });
        }
        
        Log('backend', 'info', 'controller', `Calling service to schedule maintenance for depotId: ${depotId}`);
        const result = await scheduleMaintenance(depotId, Number(availableHours));
        
        Log('backend', 'info', 'controller', 'Response generated successfully');
        Log('backend', 'info', 'controller', 'Response sent');
        
        return res.status(200).json(result);
    } catch (error) {
        Log('backend', 'error', 'controller', `Unexpected failure in controller: ${error.message}`);
        next(error);
    }
}

module.exports = { handleSchedule };
