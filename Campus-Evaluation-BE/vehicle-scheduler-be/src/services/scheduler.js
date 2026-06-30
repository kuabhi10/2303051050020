const axios = require('axios');
const config = require('../config');
const { knapsackTasks } = require('../utils/knapsack');
const { Log } = require('../../../logging-middleware');

async function scheduleMaintenance(depotId, availableHours) {
    Log('backend', 'info', 'service', `Starting scheduling process for depot: ${depotId}`);
    
    let depot;
    try {
        Log('backend', 'info', 'service', `Calling depot API for depotId: ${depotId}`);
        const depotRes = await axios.get(`${config.evaluationApiUrl}/depots/${depotId}`, {
            headers: { 'Authorization': `Bearer ${config.evaluationApiKey}` }
        });
        depot = depotRes.data;
        Log('backend', 'info', 'service', `Depot API success for depotId: ${depotId}`);
    } catch (error) {
        Log('backend', 'error', 'service', `Depot API failure for depotId: ${depotId} - ${error.message}`);
        throw error;
    }
    
    let tasks;
    try {
        Log('backend', 'info', 'service', `Calling task API for depotId: ${depotId}`);
        const tasksRes = await axios.get(`${config.evaluationApiUrl}/depots/${depotId}/tasks`, {
            headers: { 'Authorization': `Bearer ${config.evaluationApiKey}` }
        });
        tasks = tasksRes.data;
        Log('backend', 'info', 'service', `Task API success for depotId: ${depotId}. Found ${tasks.length} tasks.`);
    } catch (error) {
        Log('backend', 'error', 'service', `Task API failure for depotId: ${depotId} - ${error.message}`);
        throw error;
    }
        
    try {
        const selectedTasks = knapsackTasks(tasks, availableHours);
        
        let totalDuration = 0;
        let totalScore = 0;
        for (const t of selectedTasks) {
            const duration = t.duration !== undefined ? t.duration : 0;
            const score = t.priority !== undefined ? t.priority : (t.operational_impact_score || 0);
            totalDuration += duration;
            totalScore += score;
        }
        
        return {
            depot,
            available_mechanic_hours: availableHours,
            selected_maintenance_tasks: selectedTasks,
            total_duration: totalDuration,
            total_operational_impact_score: totalScore
        };
    } catch (error) {
        Log('backend', 'error', 'service', `Unexpected failure in optimizing: ${error.message}`);
        throw error;
    }
}

module.exports = { scheduleMaintenance };
